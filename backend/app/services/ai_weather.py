import requests
import pandas as pd
from prophet import Prophet
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import traceback

from app.models.weather_model import WeatherData, WeatherPrediction

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
        # Struktur API BMKG terbaru umumnya seperti ini:
        # {
        #   "lokasi": {"id": "...", "kecamatan": "...", "koordinat": {...}},
        #   "cuaca": [
        #       {"datetime": "2025-10-21T00:00:00Z", "t": 28, "hu": 85, "weather": "Cerah"},
        #       ...
        #   ]
        # }

        lokasi = data.get("lokasi", {})
        location_name = lokasi.get("kecamatan") or lokasi.get("id", "Unknown")

        cuaca_list = data.get("cuaca", [])
        if not isinstance(cuaca_list, list):
            raise ValueError("Struktur BMKG tidak sesuai (cuaca bukan list)")

        for item in cuaca_list:
            records.append({
                "ds": item.get("datetime"),
                "temperature": float(item.get("t", 0)),
                "humidity": float(item.get("hu", 0)),
                "rainfall": None,
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
            location_name=row.get("location", "BMKG Banjarnegara"),
            temperature=row["temperature"],
            humidity=row.get("humidity"),
            rainfall=row.get("rainfall"),
            date=row["ds"].date(),
        )
        db.add(weather)
    db.commit()


# ---- 3. Prediksi suhu dengan Prophet ----
def predict_weather(db: Session, days_ahead: int = 3):
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

    # Latih model Prophet
    model = Prophet(daily_seasonality=True, yearly_seasonality=True)
    try:
        model.fit(df)
    except Exception as e:
        logging.error("Gagal melatih model Prophet: %s", traceback.format_exc())
        raise RuntimeError(f"Kesalahan saat melatih model: {e}")

    # Prediksi untuk beberapa hari ke depan
    future = model.make_future_dataframe(periods=days_ahead, freq="D")
    forecast = model.predict(future)

    required_cols = {"ds", "yhat", "yhat_lower", "yhat_upper"}
    missing = required_cols - set(forecast.columns)
    if missing:
        logging.error("Kolom hasil prediksi hilang: %s", missing)
        raise RuntimeError(f"Missing forecast columns: {missing}")

    results = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(days_ahead)

    predictions = []
    for _, row in results.iterrows():
        pred = WeatherPrediction(
            date=row["ds"].date(),
            predicted_temp=row["yhat"],
            lower_bound=row["yhat_lower"],
            upper_bound=row["yhat_upper"],
            source="BMKG Banjarnegara"
        )
        db.add(pred)
        predictions.append(pred)

    db.commit()
    return predictions
