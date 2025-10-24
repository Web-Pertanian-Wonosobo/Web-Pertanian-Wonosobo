from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.services.ai_weather import predict_weather, fetch_weather_data, save_weather_data
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
        return {"status": "success", "predictions": preds}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# === 2️⃣ CUACA TERKINI (HANYA HARI INI, TANPA DUPLIKAT) ===
@router.get("/current")
def get_current_weather(
    q: str = Query(None, description="Nama kecamatan opsional untuk filter"),
    db: Session = Depends(get_db),
):
    """
    Ambil data cuaca rata-rata per kecamatan untuk HARI INI saja (tanpa duplikat).
    """
    try:
        today = datetime.date.today()

        query = (
            db.query(
                WeatherData.location_name,
                func.avg(WeatherData.temperature).label("temperature"),
                func.avg(WeatherData.humidity).label("humidity"),
                func.sum(WeatherData.rainfall).label("rainfall"),
                func.avg(WeatherData.wind_speed).label("wind_speed"),
            )
            .filter(WeatherData.date == today)
            .group_by(WeatherData.location_name)
        )

        if q:
            query = query.filter(WeatherData.location_name.ilike(f"%{q}%"))

        rows = query.all()

        if rows:
            data = []
            for r in rows:
                temp = float(r.temperature or 0)
                rain = float(r.rainfall or 0)
                humidity = float(r.humidity or 0)
                wind = float(r.wind_speed or 0)

                condition = (
                    "Hujan Lebat" if rain > 15
                    else "Hujan Ringan" if rain > 5
                    else "Cerah" if temp > 20
                    else "Dingin"
                )
                risk = (
                    "Tinggi" if rain > 15
                    else "Sedang" if rain > 5
                    else "Rendah"
                )

                data.append({
                    "date": today.isoformat(),
                    "location_name": r.location_name,
                    "temperature": round(temp, 1),
                    "humidity": round(humidity, 1),
                    "rainfall": round(rain, 1),
                    "wind_speed": round(wind, 1),
                    "condition": condition,
                    "risk": risk,
                })

            return {
                "status": "success",
                "total_kecamatan": len(data),
                "data": data
            }

        # fallback dummy kalau kosong
        logging.warning("⚠️ Tidak ada data cuaca hari ini, fallback dummy...")
        dummy = []
        for d in ["Wadaslintang", "Kalibawang", "Kejajar", "Kaligowong"]:
            temp = round(random.uniform(18, 28), 1)
            rain = round(random.uniform(0, 20), 1)
            humidity = round(random.uniform(60, 90), 1)
            wind = round(random.uniform(0.5, 3.5), 1)
            condition = "Cerah" if temp > 20 else "Dingin"
            risk = "Sedang" if rain > 5 else "Rendah"
            dummy.append({
                "date": today.isoformat(),
                "location_name": d,
                "temperature": temp,
                "humidity": humidity,
                "rainfall": rain,
                "wind_speed": wind,
                "condition": condition,
                "risk": risk,
            })

        return {"status": "success", "total_kecamatan": len(dummy), "data": dummy}

    except Exception as e:
        logging.error(f"❌ Gagal ambil data cuaca: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# === 3️⃣ SINKRONISASI MANUAL DENGAN BMKG ===
@router.post("/sync")
def sync_weather_data(db: Session = Depends(get_db)):
    """Sinkronisasi data cuaca dari BMKG"""
    try:
        df = fetch_weather_data()
        if df.empty:
            raise HTTPException(status_code=404, detail="Tidak ada data dari BMKG")

        save_weather_data(db, df)
        logging.info(f"✅ Berhasil sinkron {len(df)} data dari BMKG.")
        return {
            "status": "success",
            "message": f"Berhasil sinkron {len(df)} data dari BMKG",
            "records": len(df),
        }

    except Exception as e:
        logging.error(f"❌ Gagal sinkronisasi: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
