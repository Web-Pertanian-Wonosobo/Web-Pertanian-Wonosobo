from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.services.ai_weather import (
    predict_weather,
    predict_weather_by_coordinates,
    fetch_weather_data,
    fetch_weather_by_coordinates,
    save_weather_data,
    DISTRICTS
)
from app.db import get_db
from app.schemas.weather_schema import WeatherPredictionResponse
from app.models.weather_model import WeatherData
import datetime, logging, traceback

router = APIRouter(prefix="/weather", tags=["Weather"])

# === 1️⃣ PREDIKSI CUACA BERDASARKAN KOORDINAT ===
@router.get("/predict/coordinates")
def predict_weather_coordinates(
    lat: float = Query(..., description="Latitude koordinat lokasi"),
    lon: float = Query(..., description="Longitude koordinat lokasi"),
    location_name: str = Query(None, description="Nama lokasi (opsional)"),
    days: int = Query(7, description="Jumlah hari prediksi (default: 7)"),
    db: Session = Depends(get_db)
):
    """
    Prediksi cuaca berdasarkan koordinat spesifik tanpa interpolasi.
    Langsung menggunakan data dari OpenWeather API untuk koordinat yang diberikan.
    """
    try:
        # Validasi koordinat
        if not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude harus antara -90 dan 90")
        if not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude harus antara -180 dan 180")
        
        # Generate prediksi
        preds = predict_weather_by_coordinates(db, lat, lon, location_name, days)
        
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
        
        return {
            "status": "success", 
            "coordinates": {"lat": lat, "lon": lon},
            "location_name": location_name or f"Lat{lat}_Lon{lon}",
            "predictions": predictions_data,
            "method": "Direct OpenWeather API (No Interpolation)"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in predict_weather_coordinates: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# === 1️⃣A PREDIKSI CUACA (LEGACY) ===
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


# === 2️⃣ CUACA TERKINI (DIRECT OPENWEATHER, TANPA INTERPOLASI) ===
@router.get("/current")
def get_current_weather(
    q: str = Query(None, description="Filter nama kecamatan (opsional)"),
    force_refresh: bool = Query(False, description="Jika true, fetch ulang dari OpenWeather"),
    db: Session = Depends(get_db),
):
    """
    Ambil data cuaca hari ini untuk semua kecamatan yang didefinisikan di DISTRICTS.
    - Jika data untuk hari ini belum ada atau force_refresh=True: fetch langsung dari OpenWeather.
    - Tanpa interpolasi; setiap kecamatan menggunakan koordinatnya sendiri.
    """
    try:
        today = datetime.date.today()
        # Filter districts jika ada query
        districts = [d for d in DISTRICTS if (not q or q.lower() in d["name"].lower())]
        results = []

        for d in districts:
            name = d["name"]
            # Cek apakah sudah ada data hari ini
            record = db.query(WeatherData).filter(
                WeatherData.location_name == name,
                WeatherData.date == today
            ).first()

            if record is None or force_refresh:
                try:
                    df = fetch_weather_by_coordinates(d["lat"], d["lon"], name)
                    # Simpan semua (current + forecast) agar berguna untuk prediksi
                    save_weather_data(db, df)
                    record = db.query(WeatherData).filter(
                        WeatherData.location_name == name,
                        WeatherData.date == today
                    ).first()
                except Exception as e:
                    logging.warning(f"⚠️ Gagal fetch {name}: {e}")
                    record = None

            if record:
                temp = float(record.temperature or 0)
                rain = float(record.rainfall or 0)
                humidity = float(record.humidity or 0)
                wind = float(record.wind_speed or 0)
                condition = (
                    "Hujan Lebat" if rain > 15 else
                    "Hujan Ringan" if rain > 5 else
                    "Cerah" if temp > 20 else
                    "Dingin"
                )
                risk = (
                    "Tinggi" if rain > 15 else
                    "Sedang" if rain > 5 else
                    "Rendah"
                )
                results.append({
                    "date": today.isoformat(),
                    "location_name": name,
                    "temperature": round(temp, 1),
                    "humidity": round(humidity, 1),
                    "rainfall": round(rain, 1),
                    "wind_speed": round(wind, 1),
                    "condition": condition,
                    "risk": risk,
                    "is_live_fetch": force_refresh or record is None,
                    "source": "OpenWeather Direct"
                })
            else:
                results.append({
                    "date": today.isoformat(),
                    "location_name": name,
                    "error": "Data tidak tersedia",
                    "source": "OpenWeather Direct"
                })

        return {
            "status": "success",
            "total": len(results),
            "force_refresh": force_refresh,
            "data": results
        }
    except Exception as e:
        logging.error(f"❌ Gagal ambil data cuaca direct: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

# === 2️⃣A CUACA TERKINI BERDASARKAN KOORDINAT SPESIFIK ===
@router.get("/current/coordinates")
def get_current_weather_coordinates(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    location_name: str = Query(None, description="Nama lokasi opsional"),
    db: Session = Depends(get_db),
):
    """Ambil cuaca terkini untuk koordinat spesifik langsung dari OpenWeather."""
    try:
        if not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude harus antara -90 dan 90")
        if not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude harus antara -180 dan 180")

        df = fetch_weather_by_coordinates(lat, lon, location_name)
        # Ambil baris pertama sebagai current
        df_sorted = df.sort_values("ds")
        current_row = df_sorted.iloc[0]
        temp = float(current_row["temperature"]) if current_row.get("temperature") is not None else 0.0
        rain = float(current_row.get("rainfall", 0))
        humidity = float(current_row.get("humidity", 0))
        wind = float(current_row.get("wind_speed", 0))
        condition = (
            "Hujan Lebat" if rain > 15 else
            "Hujan Ringan" if rain > 5 else
            "Cerah" if temp > 20 else
            "Dingin"
        )
        risk = (
            "Tinggi" if rain > 15 else
            "Sedang" if rain > 5 else
            "Rendah"
        )
        return {
            "status": "success",
            "coordinates": {"lat": lat, "lon": lon},
            "location_name": location_name or f"Lat{lat}_Lon{lon}",
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "rainfall": round(rain, 1),
            "wind_speed": round(wind, 1),
            "condition": condition,
            "risk": risk,
            "source": "OpenWeather Direct",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Gagal ambil cuaca koordinat: {traceback.format_exc()}")
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

# === 3️⃣A SINKRONISASI UNTUK KOORDINAT SPESIFIK ===
@router.post("/sync/coordinates")
def sync_weather_coordinates(
    lat: float = Query(..., description="Latitude koordinat lokasi"),
    lon: float = Query(..., description="Longitude koordinat lokasi"),
    location_name: str = Query(None, description="Nama lokasi (opsional)"),
    db: Session = Depends(get_db)
):
    """Sinkronisasi data cuaca untuk koordinat spesifik dari OpenWeather API"""
    try:
        # Validasi koordinat
        if not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude harus antara -90 dan 90")
        if not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude harus antara -180 dan 180")
        
        df = fetch_weather_by_coordinates(lat, lon, location_name)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Tidak ada data dari OpenWeather untuk koordinat {lat}, {lon}")

        save_weather_data(db, df)
        location_display = location_name or f"Lat{lat}_Lon{lon}"
        logging.info(f"✅ Berhasil sinkron {len(df)} data untuk {location_display} dari OpenWeather.")
        return {
            "status": "success",
            "message": f"Berhasil sinkron {len(df)} data untuk {location_display} dari OpenWeather",
            "coordinates": {"lat": lat, "lon": lon},
            "location_name": location_display,
            "records": len(df),
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Gagal sinkronisasi koordinat: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
