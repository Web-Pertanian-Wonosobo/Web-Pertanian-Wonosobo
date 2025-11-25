"""
Router untuk forecasting harga komoditas
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import get_db
from app.services.price_forecasting import PriceForecaster

router = APIRouter(prefix="/forecast", tags=["Price Forecasting"])


@router.get("/commodity/{commodity_name}")
def forecast_commodity_price(
    commodity_name: str,
    days_forward: int = Query(30, ge=1, le=90, description="Jumlah hari prediksi (1-90)"),
    days_back: int = Query(90, ge=30, le=365, description="Jumlah hari data historis (30-365)"),
    use_synthetic: bool = Query(True, description="Gunakan data sintetis jika data tidak cukup"),
    db: Session = Depends(get_db)
):
    """
    Melakukan forecasting harga untuk satu komoditas
    
    Args:
        commodity_name: Nama komoditas (contoh: "Bawang Merah", "Cabai Merah")
        days_forward: Jumlah hari ke depan untuk prediksi
        days_back: Jumlah hari kebelakang untuk data historis
        use_synthetic: Gunakan data sintetis sebagai fallback jika data tidak cukup
        
    Returns:
        Forecast results dengan prediksi, statistik, dan rekomendasi waktu jual terbaik
    """
    try:
        forecaster = PriceForecaster(db)
        result = forecaster.forecast_prices(
            commodity_name=commodity_name,
            days_forward=days_forward,
            days_back=days_back,
            use_synthetic_fallback=use_synthetic
        )
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=404,
                detail=result.get("message", "Forecasting failed")
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error forecasting {commodity_name}: {str(e)}"
        )


@router.post("/batch")
def batch_forecast(
    commodity_names: List[str],
    days_forward: int = Query(30, ge=1, le=90, description="Jumlah hari prediksi"),
    db: Session = Depends(get_db)
):
    """
    Melakukan forecasting untuk multiple komoditas sekaligus
    
    Args:
        commodity_names: List nama komoditas
        days_forward: Jumlah hari prediksi
        
    Returns:
        List of forecast results untuk setiap komoditas
    """
    try:
        forecaster = PriceForecaster(db)
        results = forecaster.batch_forecast(
            commodity_names=commodity_names,
            days_forward=days_forward
        )
        
        successful = sum(1 for r in results if r.get("success", False))
        
        return {
            "total_requested": len(commodity_names),
            "successful_forecasts": successful,
            "failed_forecasts": len(commodity_names) - successful,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error in batch forecasting: {str(e)}"
        )


@router.get("/available-commodities")
def get_available_commodities(db: Session = Depends(get_db)):
    """
    Mendapatkan daftar komoditas yang tersedia untuk forecasting
    
    Returns:
        List of commodity names yang ada di database
    """
    try:
        forecaster = PriceForecaster(db)
        commodities = forecaster.get_available_commodities()
        
        return {
            "success": True,
            "total": len(commodities),
            "commodities": sorted(commodities)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting commodities: {str(e)}"
        )


@router.get("/quick-predict/{commodity_name}")
def quick_price_prediction(
    commodity_name: str,
    target_date: Optional[str] = Query(None, description="Target date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Prediksi cepat harga untuk tanggal tertentu
    
    Args:
        commodity_name: Nama komoditas
        target_date: Tanggal target (optional, default: 7 hari dari sekarang)
        
    Returns:
        Prediksi harga untuk tanggal tersebut
    """
    try:
        from datetime import datetime, timedelta
        
        # Parse target date
        if target_date:
            target = datetime.strptime(target_date, "%Y-%m-%d")
        else:
            target = datetime.now() + timedelta(days=7)
        
        days_diff = (target - datetime.now()).days
        
        if days_diff < 0:
            raise HTTPException(
                status_code=400,
                detail="Target date cannot be in the past"
            )
        
        if days_diff > 90:
            raise HTTPException(
                status_code=400,
                detail="Target date too far in the future (max 90 days)"
            )
        
        forecaster = PriceForecaster(db)
        result = forecaster.forecast_prices(
            commodity_name=commodity_name,
            days_forward=days_diff + 5,  # Add buffer
            days_back=90
        )
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=404,
                detail=result.get("message", "Forecasting failed")
            )
        
        # Find prediction for target date
        target_str = target.strftime("%Y-%m-%d")
        prediction = None
        
        for pred in result.get("predictions", []):
            if pred["date"] == target_str:
                prediction = pred
                break
        
        if not prediction:
            raise HTTPException(
                status_code=404,
                detail=f"No prediction available for {target_str}"
            )
        
        return {
            "success": True,
            "commodity": commodity_name,
            "target_date": target_str,
            "current_price": result.get("current_price", 0),
            "predicted_price": prediction["predicted_price"],
            "confidence_range": {
                "lower": prediction["lower_bound"],
                "upper": prediction["upper_bound"]
            },
            "price_change": {
                "amount": round(prediction["predicted_price"] - result.get("current_price", 0), 2),
                "percentage": round(
                    ((prediction["predicted_price"] - result.get("current_price", 0)) / 
                     result.get("current_price", 1)) * 100, 2
                )
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error in quick prediction: {str(e)}"
        )


@router.post("/generate-sample-data")
def generate_sample_data(
    commodity_name: str = Query(..., description="Nama komoditas"),
    base_price: float = Query(10000, description="Harga dasar (Rp)"),
    days: int = Query(90, ge=30, le=365, description="Jumlah hari data (30-365)"),
    db: Session = Depends(get_db)
):
    """
    Generate sample data untuk testing forecasting.
    Data akan disimpan ke database.
    
    Args:
        commodity_name: Nama komoditas
        base_price: Harga dasar untuk generate data
        days: Jumlah hari data yang akan digenerate
        
    Returns:
        Success status dan jumlah data yang dibuat
    """
    try:
        from app.models.market_model import MarketPrice
        from datetime import datetime, timedelta
        import random
        
        # Check if data already exists
        existing = db.query(MarketPrice).filter(
            MarketPrice.commodity_name.ilike(f"%{commodity_name}%")
        ).count()
        
        if existing >= days:
            return {
                "success": True,
                "message": f"Data already exists for {commodity_name} ({existing} records)",
                "existing_records": existing
            }
        
        # Generate sample data
        records_created = 0
        start_date = datetime.now() - timedelta(days=days)
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            
            # Generate realistic price variations
            trend = base_price * 0.1 * (i / days)  # 10% trend
            seasonality = base_price * 0.05 * (1 if (i % 7) < 4 else -1)  # Weekly pattern
            noise = random.uniform(-base_price * 0.03, base_price * 0.03)  # Random noise
            
            price = max(base_price * 0.8, base_price + trend + seasonality + noise)
            
            # Create record
            market_data = MarketPrice(
                user_id=1,  # Default admin user
                commodity_name=commodity_name,
                price=round(price, 2),
                unit="kg",
                market_location="Wonosobo Kota",
                date=date.date(),
                created_at=datetime.now()
            )
            
            db.add(market_data)
            records_created += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Successfully generated {records_created} sample records for {commodity_name}",
            "commodity": commodity_name,
            "records_created": records_created,
            "date_range": {
                "start": start_date.strftime("%Y-%m-%d"),
                "end": datetime.now().strftime("%Y-%m-%d")
            },
            "hint": f"You can now forecast this commodity at /forecast/commodity/{commodity_name}"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error generating sample data: {str(e)}"
        )
