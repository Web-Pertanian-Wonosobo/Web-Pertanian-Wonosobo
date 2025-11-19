"""
Service untuk forecasting harga komoditas menggunakan Prophet.
Menggunakan data historis dari database untuk prediksi harga masa depan.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from prophet import Prophet
from sqlalchemy.orm import Session
from app.models.market_model import MarketPrice
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PriceForecaster:
    """
    Class untuk forecasting harga komoditas dengan Prophet
    """
    
    def __init__(self, db: Session):
        self.db = db
        
    def get_historical_data(
        self, 
        commodity_name: str, 
        days_back: int = 90
    ) -> pd.DataFrame:
        """
        Mengambil data historis harga dari database
        
        Args:
            commodity_name: Nama komoditas
            days_back: Jumlah hari kebelakang untuk data historis
            
        Returns:
            DataFrame dengan kolom ds (tanggal) dan y (harga)
        """
        try:
            start_date = datetime.now() - timedelta(days=days_back)
            
            # Query data dari database
            prices = self.db.query(MarketPrice).filter(
                MarketPrice.commodity_name.ilike(f"%{commodity_name}%"),
                MarketPrice.date >= start_date
            ).order_by(MarketPrice.date.asc()).all()
            
            if not prices:
                logger.warning(f"No historical data found for {commodity_name}")
                return pd.DataFrame(columns=['ds', 'y'])
            
            # Convert ke DataFrame Prophet format
            data = []
            for price in prices:
                data.append({
                    'ds': price.date,
                    'y': float(price.price)
                })
            
            df = pd.DataFrame(data)
            
            # Aggregate harian (jika ada multiple entries per hari)
            df = df.groupby('ds').agg({'y': 'mean'}).reset_index()
            
            logger.info(f"Retrieved {len(df)} historical records for {commodity_name}")
            return df
            
        except Exception as e:
            logger.error(f"Error getting historical data: {e}")
            return pd.DataFrame(columns=['ds', 'y'])
    
    def forecast_prices(
        self,
        commodity_name: str,
        days_forward: int = 30,
        days_back: int = 90,
        use_synthetic_fallback: bool = True
    ) -> Dict:
        """
        Melakukan forecasting harga untuk beberapa hari ke depan
        
        Args:
            commodity_name: Nama komoditas
            days_forward: Jumlah hari prediksi ke depan
            days_back: Jumlah hari data historis yang digunakan
            use_synthetic_fallback: Gunakan data sintetis jika data tidak cukup
            
        Returns:
            Dictionary berisi forecast results dan metadata
        """
        try:
            # Get historical data
            df = self.get_historical_data(commodity_name, days_back)
            
            # Fallback: gunakan data sintetis jika data tidak cukup
            is_synthetic = False
            if (df.empty or len(df) < 10) and use_synthetic_fallback:
                logger.warning(f"Insufficient real data ({len(df)} points), using synthetic data for {commodity_name}")
                
                # Get current price from recent data or use default
                base_price = 10000  # Default base price
                if not df.empty and len(df) > 0:
                    base_price = float(df['y'].iloc[-1])
                
                # Generate synthetic data
                df = generate_synthetic_data(commodity_name, base_price, 90)
                is_synthetic = True
                logger.info(f"Generated {len(df)} synthetic data points for {commodity_name}")
            elif df.empty or len(df) < 10:
                return {
                    "success": False,
                    "message": f"Insufficient data for forecasting. Need at least 10 data points, found {len(df)}",
                    "commodity": commodity_name,
                    "historical_data_points": len(df),
                    "hint": "Use use_synthetic_fallback=true or sync more market data"
                }
            
            # Initialize Prophet model
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=False if len(df) < 365 else True,
                changepoint_prior_scale=0.05,  # Flexibility of trend
                seasonality_prior_scale=10.0,   # Flexibility of seasonality
            )
            
            # Fit model
            logger.info(f"Training Prophet model for {commodity_name}...")
            model.fit(df)
            
            # Create future dataframe
            future = model.make_future_dataframe(periods=days_forward, freq='D')
            
            # Make predictions
            forecast = model.predict(future)
            
            # Extract results
            historical = []
            predictions = []
            
            last_actual_date = pd.Timestamp(df['ds'].max())
            
            for idx, row in forecast.iterrows():
                date_str = row['ds'].strftime('%Y-%m-%d')
                row_date = pd.Timestamp(row['ds'])
                
                data_point = {
                    "date": date_str,
                    "predicted_price": round(float(row['yhat']), 2),
                    "lower_bound": round(float(row['yhat_lower']), 2),
                    "upper_bound": round(float(row['yhat_upper']), 2),
                }
                
                # Separate historical vs future predictions
                if row_date <= last_actual_date:
                    # Find actual value if exists
                    actual_row = df[df['ds'] == row_date]
                    if not actual_row.empty:
                        data_point["actual_price"] = round(float(actual_row['y'].values[0]), 2)
                        historical.append(data_point)
                else:
                    predictions.append(data_point)
            
            # Calculate statistics
            current_price = float(df['y'].iloc[-1]) if not df.empty else 0
            avg_predicted = np.mean([p['predicted_price'] for p in predictions])
            price_trend = "naik" if avg_predicted > current_price else "turun" if avg_predicted < current_price else "stabil"
            
            result = {
                "success": True,
                "commodity": commodity_name,
                "model": "Prophet (Synthetic Data)" if is_synthetic else "Prophet",
                "is_synthetic": is_synthetic,
                "current_price": round(current_price, 2),
                "last_actual_date": last_actual_date.strftime('%Y-%m-%d'),
                "forecast_days": days_forward,
                "historical_data_points": len(df),
                "statistics": {
                    "average_predicted_price": round(avg_predicted, 2),
                    "min_predicted_price": round(min([p['predicted_price'] for p in predictions]), 2),
                    "max_predicted_price": round(max([p['predicted_price'] for p in predictions]), 2),
                    "price_trend": price_trend,
                    "trend_percentage": round(((avg_predicted - current_price) / current_price) * 100, 2)
                },
                "historical": historical[-30:],  # Last 30 days historical
                "predictions": predictions,
                "best_selling_dates": self._find_best_selling_dates(predictions)
            }
            
            logger.info(f"Forecast completed for {commodity_name}")
            return result
            
        except Exception as e:
            logger.error(f"Error in forecasting: {e}")
            return {
                "success": False,
                "message": f"Forecasting error: {str(e)}",
                "commodity": commodity_name
            }
    
    def _find_best_selling_dates(self, predictions: List[Dict]) -> List[Dict]:
        """
        Menemukan tanggal terbaik untuk menjual berdasarkan prediksi harga tertinggi
        
        Args:
            predictions: List of prediction dictionaries
            
        Returns:
            List of best selling dates with highest predicted prices
        """
        if not predictions:
            return []
        
        # Sort by predicted price descending
        sorted_predictions = sorted(
            predictions, 
            key=lambda x: x['predicted_price'], 
            reverse=True
        )
        
        # Return top 5 dates
        best_dates = []
        for pred in sorted_predictions[:5]:
            best_dates.append({
                "date": pred['date'],
                "predicted_price": pred['predicted_price'],
                "confidence_range": f"Rp {pred['lower_bound']:,.0f} - Rp {pred['upper_bound']:,.0f}"
            })
        
        return best_dates
    
    def batch_forecast(
        self,
        commodity_names: List[str],
        days_forward: int = 30
    ) -> List[Dict]:
        """
        Melakukan forecasting untuk multiple komoditas
        
        Args:
            commodity_names: List nama komoditas
            days_forward: Jumlah hari prediksi
            
        Returns:
            List of forecast results
        """
        results = []
        
        for commodity in commodity_names:
            result = self.forecast_prices(commodity, days_forward)
            results.append(result)
        
        return results
    
    def get_available_commodities(self) -> List[str]:
        """
        Mendapatkan daftar komoditas yang tersedia di database
        
        Returns:
            List of unique commodity names
        """
        try:
            commodities = self.db.query(MarketPrice.commodity_name)\
                .distinct()\
                .filter(MarketPrice.commodity_name.isnot(None))\
                .all()
            
            return [c[0] for c in commodities]
        except Exception as e:
            logger.error(f"Error getting commodities: {e}")
            return []


def generate_synthetic_data(
    commodity_name: str,
    base_price: float,
    days: int = 90
) -> pd.DataFrame:
    """
    Generate data sintetis untuk testing/demo jika tidak ada data historis
    
    Args:
        commodity_name: Nama komoditas
        base_price: Harga dasar
        days: Jumlah hari data
        
    Returns:
        DataFrame with synthetic price data
    """
    dates = pd.date_range(
        end=datetime.now(),
        periods=days,
        freq='D'
    )
    
    # Generate synthetic prices with trend and seasonality
    trend = np.linspace(0, base_price * 0.1, days)  # 10% trend
    seasonality = base_price * 0.05 * np.sin(np.linspace(0, 4*np.pi, days))  # Seasonal variation
    noise = np.random.normal(0, base_price * 0.02, days)  # Random noise
    
    prices = base_price + trend + seasonality + noise
    prices = np.maximum(prices, base_price * 0.8)  # Ensure prices don't go too low
    
    df = pd.DataFrame({
        'ds': dates,
        'y': prices
    })
    
    return df
