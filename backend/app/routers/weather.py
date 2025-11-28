from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.services.ai_weather import predict_weather, fetch_weather_data, save_weather_data
from app.services.weather_interpolation import (
    get_or_interpolate_weather,
    bulk_interpolate_missing_locations,
    KECAMATAN_COORDINATES
)
from app.db import get_db
from app.schemas.weather_schema import WeatherPredictionResponse
from app.models.weather_model import WeatherData
import datetime, random, logging, traceback

router = APIRouter(prefix="/weather", tags=["Weather"])

# === 1️⃣ PREDIKSI CUACA ===
@router.get("/predict")
def get_predictions(days: int = 7, location: str = None, db: Session = Depends(get_db)):
    """
    Prediksi suhu per lokasi (jika diberikan) atau keseluruhan (default).
    """
    try:
        if location:
            preds = predict_weather(db, days_ahead=days, location=location)
        else:
            preds = predict_weather(db, days_ahead=days)
        
        # Konversi SQLAlchemy objects ke dictionary
        predictions_data = []
        for pred in preds:
            predictions_data.append({
                "date": pred.date.isoformat() if hasattr(pred.date, 'isoformat') else str(pred.date),
                "predicted_temp": float(pred.predicted_temp) if pred.predicted_temp is not None else 0.0,
                "lower_bound": float(pred.lower_bound) if pred.lower_bound is not None else 0.0,
                "upper_bound": float(pred.upper_bound) if pred.upper_bound is not None else 0.0,
                "source": pred.source or "Unknown"
            })
        
        return {"status": "success", "predictions": predictions_data}
    except Exception as e:
        logging.error(f"Error in get_predictions: {e}")
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


# === 2️⃣ CUACA TERKINI (DENGAN INTERPOLASI OTOMATIS) ===
@router.get("/current")
def get_current_weather(
    q: str = Query(None, description="Nama kecamatan opsional untuk filter"),
    db: Session = Depends(get_db),
):
    """
    Ambil data cuaca untuk semua kecamatan (HARI INI).
    - Jika ada data OpenWeather: gunakan data real
    - Jika tidak ada: interpolasi dari kecamatan terdekat
    """
    try:
        today = datetime.date.today()
        
        # Dapatkan semua nama kecamatan dari koordinat
        all_kecamatan = [loc.title() for loc in KECAMATAN_COORDINATES.keys()]
        
        # Filter jika ada query
        if q:
            all_kecamatan = [loc for loc in all_kecamatan if q.lower() in loc.lower()]
        
        # Bulk interpolate untuk semua kecamatan
        data = bulk_interpolate_missing_locations(db, today, all_kecamatan)
        
        if not data:
            logging.warning("⚠️ Tidak ada data cuaca dan interpolasi gagal")
            # Fallback ke dummy data jika benar-benar tidak ada data sama sekali
            dummy = []
            for loc in all_kecamatan[:5]:  # Ambil 5 kecamatan pertama
                temp = round(random.uniform(18, 28), 1)
                rain = round(random.uniform(0, 20), 1)
                humidity = round(random.uniform(60, 90), 1)
                wind = round(random.uniform(0.5, 3.5), 1)
                condition = "Cerah" if temp > 20 else "Dingin"
                risk = "Sedang" if rain > 5 else "Rendah"
                dummy.append({
                    "date": today.isoformat(),
                    "location_name": loc,
                    "temperature": temp,
                    "humidity": humidity,
                    "rainfall": rain,
                    "wind_speed": wind,
                    "condition": condition,
                    "risk": risk,
                    "is_interpolated": False,
                    "note": "Fallback dummy data"
                })
            return {"status": "success", "total_kecamatan": len(dummy), "data": dummy}
        
        # Count berapa yang real vs interpolated
        real_count = sum(1 for d in data if not d.get("is_interpolated", False))
        interpolated_count = len(data) - real_count
        
        return {
            "status": "success",
            "total_kecamatan": len(data),
            "real_data_count": real_count,
            "interpolated_count": interpolated_count,
            "data": data
        }

    except Exception as e:
        logging.error(f"❌ Gagal ambil data cuaca: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# === 3️⃣ SINKRONISASI MANUAL DENGAN OPENWEATHER ===
@router.post("/sync")
def sync_weather_data(db: Session = Depends(get_db)):
    """Sinkronisasi data cuaca dari OpenWeather API"""
    try:
        df = fetch_weather_data()
        if df.empty:
            raise HTTPException(status_code=404, detail="Tidak ada data dari OpenWeather")

        save_weather_data(db, df)
        logging.info(f"✅ Berhasil sinkron {len(df)} data dari OpenWeather.")
        return {
            "status": "success",
            "message": f"Berhasil sinkron {len(df)} data dari OpenWeather",
            "records": len(df),
        }

    except Exception as e:
        logging.error(f"❌ Gagal sinkronisasi: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
