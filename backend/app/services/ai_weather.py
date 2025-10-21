import requests
import pandas as pd
from prophet import Prophet
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.models.weather_model import WeatherData, WeatherPrediction

# Endpoint BMKG Banjarnegara
BMKG_ENDPOINT = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001"

# ---- 1. Ambil data cuaca dari API BMKG ----
def fetch_weather_data():
    res = requests.get(BMKG_ENDPOINT)
    res.raise_for_status()
    data = res.json()

    records = []

    # BMKG -> struktur JSON mungkin nested di "data" / "data"["params"]
    # kamu bisa ubah sesuai struktur sebenarnya
    for area in data.get("data", []):
        for ts in area.get("timesteps", []):
            records.append({
                "ds": ts.get("datetime"),
                "temperature": ts.get("t", {}).get("value", None),
                "humidity": ts.get("hu", {}).get("value", None),
                "rainfall": ts.get("rr", {}).get("value", None)
            })

    df = pd.DataFrame(records)
    df["ds"] = pd.to_datetime(df["ds"])
    df = df.dropna(subset=["ds", "temperature"])
    return df


# ---- 2. Simpan data mentah ke tabel weather_data ----
def save_weather_data(db: Session, df: pd.DataFrame):
    for _, row in df.iterrows():
        weather = WeatherData(
            station_name="BMKG Banjarnegara",
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
    if not query:
        df = fetch_weather_data()
        if df.empty:
            raise ValueError("Tidak ada data cuaca dari BMKG.")
        save_weather_data(db, df)
        query = db.query(WeatherData).order_by(WeatherData.date).all()

    df = pd.DataFrame([{
        "ds": r.date,
        "y": r.temperature
    } for r in query])

    # Train model Prophet
    model = Prophet(daily_seasonality=True, yearly_seasonality=True)
    model.fit(df)

    # Prediksi
    future = model.make_future_dataframe(periods=days_ahead, freq="D")
    forecast = model.predict(future)

    results = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(days_ahead)
    # Validate forecast columns to avoid cryptic KeyError messages (e.g. 'ds')
    required_cols = {"ds", "yhat", "yhat_lower", "yhat_upper"}
    present_cols = set(forecast.columns)
    missing = required_cols - present_cols
    if missing:
        logging.error("Forecast columns missing: %s", present_cols)
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
