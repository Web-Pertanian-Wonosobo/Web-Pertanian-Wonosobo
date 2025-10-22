import requests
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging
import traceback
import numpy as np

from app.models.weather_model import WeatherData, WeatherPrediction

# Try to import Prophet
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
    logging.info("✅ Prophet ML library loaded successfully")
except Exception as e:
    logging.info("ℹ️ Prophet not available. Will use Simple Moving Average fallback method.")
    PROPHET_AVAILABLE = False

# Endpoint BMKG Banjarnegara (contoh)
BMKG_ENDPOINT = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001"


# ---- 1. Ambil data cuaca dari API BMKG ----
def fetch_weather_data():
    try:
        res = requests.get(BMKG_ENDPOINT, timeout=15)
        res.raise_for_status()
        data = res.json()
    except Exception as e:
        logging.error("Gagal mengambil data dari BMKG: %s", traceback.format_exc())
        raise RuntimeError(f"Gagal mengambil data BMKG: {e}")

    records = []

    try:
        # Struktur API BMKG yang baru: data -> [lokasi -> cuaca]
        location_name = data.get("lokasi", {}).get("desa", "Unknown")
        
        # Loop through data array
        for item in data.get("data", []):
            cuaca_array = item.get("cuaca", [])
            
            # cuaca is an array of arrays, flatten it
            for day_forecast in cuaca_array:
                for forecast in day_forecast:
                    records.append({
                        "ds": forecast.get("datetime"),
                        "temperature": float(forecast.get("t", 0)),
                        "humidity": float(forecast.get("hu", 0)),
                        "rainfall": float(forecast.get("tp", 0)),
                        "wind_speed": float(forecast.get("ws", 0)),
                        "location": location_name
                    })
    except Exception as e:
        logging.error("Gagal parsing data BMKG: %s", traceback.format_exc())
        raise RuntimeError(f"Struktur JSON BMKG tidak sesuai: {e}")

    df = pd.DataFrame(records)
    if df.empty:
        raise ValueError("Data BMKG kosong atau tidak terbaca.")

    df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
    df = df.dropna(subset=["ds", "temperature"])
    return df


# ---- 2. Simpan data mentah ke tabel weather_data ----
def save_weather_data(db: Session, df: pd.DataFrame):
    for _, row in df.iterrows():
        weather = WeatherData(
            location_name=row.get("location", "BMKG"),
            temperature=row["temperature"],
            humidity=row.get("humidity"),
            rainfall=row.get("rainfall"),
            wind_speed=row.get("wind_speed"),
            date=row["ds"].date(),
        )
        db.add(weather)
    db.commit()


# ---- Simple prediction fallback ----
def predict_weather_simple(db: Session, days_ahead: int = 3):
    """Simple moving average prediction when Prophet is not available"""
    logging.info("🔄 Using Simple Moving Average for weather prediction")
    
    query = db.query(WeatherData).order_by(WeatherData.date).all()
    
    if not query:
        df = fetch_weather_data()
        if df.empty:
            raise ValueError("Tidak ada data cuaca dari BMKG.")
        save_weather_data(db, df)
        query = db.query(WeatherData).order_by(WeatherData.date).all()
    
    df = pd.DataFrame([{
        "date": r.date,
        "temperature": r.temperature
    } for r in query if r.temperature is not None])
    
    if df.empty:
        raise ValueError("Data historis kosong.")
    
    # Calculate moving average
    window_size = min(7, len(df))
    recent_temps = df.tail(window_size)["temperature"].values
    avg_temp = float(np.mean(recent_temps))  # Convert to Python float
    std_temp = float(np.std(recent_temps)) if len(recent_temps) > 1 else 3.0
    
    logging.info(f"📊 Using {window_size} days of historical data. Avg temp: {avg_temp:.1f}°C, Std: {std_temp:.1f}°C")
    
    last_date = df["date"].max()
    predictions = []
    
    for i in range(1, days_ahead + 1):
        pred_date = last_date + timedelta(days=i)
        predicted_temp = avg_temp
        
        pred = WeatherPrediction(
            date=pred_date,
            predicted_temp=round(float(predicted_temp), 2),  # Convert to Python float
            lower_bound=round(float(predicted_temp - std_temp), 2),
            upper_bound=round(float(predicted_temp + std_temp), 2),
            source="Simple Moving Average"
        )
        db.add(pred)
        predictions.append(pred)
    
    db.commit()
    logging.info(f"✅ Generated {len(predictions)} predictions using Simple Moving Average")
    return predictions


# ---- 3. Prediksi suhu dengan Prophet atau fallback ----
def predict_weather(db: Session, days_ahead: int = 3):
    """Main prediction function with fallback support"""
    
    # If Prophet is not available, use simple method
    if not PROPHET_AVAILABLE:
        logging.info("ℹ️ Using Simple Moving Average for weather predictions (Prophet not installed)")
        return predict_weather_simple(db, days_ahead)
    
    # Ambil data historis dari DB
    query = db.query(WeatherData).order_by(WeatherData.date).all()

    # Jika belum ada data, ambil dari BMKG dan simpan
    if not query:
        df = fetch_weather_data()
        if df.empty:
            raise ValueError("Tidak ada data cuaca dari BMKG.")
        save_weather_data(db, df)
        query = db.query(WeatherData).order_by(WeatherData.date).all()

    # Konversi hasil query menjadi DataFrame untuk Prophet
    df = pd.DataFrame([{
        "ds": r.date,
        "y": r.temperature
    } for r in query if r.temperature is not None])

    if df.empty or df["y"].isna().all():
        raise ValueError("Data historis kosong, tidak dapat membuat model prediksi.")

    # Try Prophet, fallback to simple if it fails
    try:
        logging.info("Attempting to use Prophet ML model for predictions...")
        
        # Latih model Prophet - remove stan_backend parameter
        model = Prophet(
            daily_seasonality=False,  # Reduced complexity
            yearly_seasonality=False,
            weekly_seasonality=False
        )
        
        # Suppress Prophet's verbose output
        import sys
        from io import StringIO
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        sys.stdout = StringIO()
        sys.stderr = StringIO()
        
        try:
            model.fit(df)
            
            # Prediksi untuk beberapa hari ke depan
            future = model.make_future_dataframe(periods=days_ahead, freq="D")
            forecast = model.predict(future)
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr

        results = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(days_ahead)

        predictions = []
        for _, row in results.iterrows():
            pred = WeatherPrediction(
                date=row["ds"].date(),
                predicted_temp=float(row["yhat"]),  # Convert to Python float
                lower_bound=float(row["yhat_lower"]),
                upper_bound=float(row["yhat_upper"]),
                source="Prophet ML Model"
            )
            db.add(pred)
            predictions.append(pred)

        db.commit()
        logging.info("✅ Prophet prediction successful")
        return predictions
        
    except Exception as e:
        logging.info("ℹ️ Prophet ML model not available. Using Simple Moving Average fallback method.")
        # Only log full error in debug mode
        if logging.getLogger().level == logging.DEBUG:
            logging.debug("Prophet error details: %s", traceback.format_exc())
        
        db.rollback()
        return predict_weather_simple(db, days_ahead)
