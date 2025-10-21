# app/services/ai_market.py
import os
import joblib
import pandas as pd
from datetime import timedelta
from prophet import Prophet
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.market_model import MarketPrice

# Folder untuk menyimpan model
MODEL_DIR = os.path.join("app", "services", "models_storage")
os.makedirs(MODEL_DIR, exist_ok=True)


def train_price_models():
    """
    Melatih model Prophet untuk setiap kombinasi komoditas dan pasar.
    Model disimpan ke folder app/services/models_storage/.
    """
    db: Session = SessionLocal()
    data = db.query(MarketPrice).all()

    if not data:
        print("⚠️ Tidak ada data harga di database.")
        db.close()
        return

    # Konversi data ke DataFrame
    df = pd.DataFrame([{
        "commodity_name": d.commodity_name.strip() if d.commodity_name else "",
        "market_location": d.market_location.strip() if d.market_location else "",
        "ds": pd.to_datetime(d.date),
        "y": float(d.price)
    } for d in data if d.price is not None and d.date is not None])

    if df.empty:
        print("⚠️ Data harga kosong atau tidak valid.")
        db.close()
        return

    # Loop untuk melatih tiap kombinasi komoditas & lokasi pasar
    for (commodity, market), group in df.groupby(["commodity_name", "market_location"]):
        if len(group) < 3:
            print(f"⏩ Data {commodity}-{market} terlalu sedikit, dilewati.")
            continue

        try:
            model = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
            model.fit(group[["ds", "y"]])

            # Simpan model ke file
            filename = f"{commodity}_{market}.pkl".replace(" ", "_").lower()
            filepath = os.path.join(MODEL_DIR, filename)
            joblib.dump(model, filepath)
            print(f"✅ Model disimpan: {filepath}")

        except Exception as e:
            print(f"❌ Gagal melatih model untuk {commodity}-{market}: {e}")

    db.close()
    print("🎯 Semua model harga berhasil dilatih dan disimpan.")


def predict_price(commodity_name: str, market_location: str, days_ahead: int = 7):
    """
    Prediksi harga ke depan menggunakan model Prophet.
    """
    filename = f"{commodity_name}_{market_location}.pkl".replace(" ", "_").lower()
    filepath = os.path.join(MODEL_DIR, filename)

    if not os.path.exists(filepath):
        return {"error": f"Model belum tersedia untuk {commodity_name} di {market_location}."}

    try:
        model: Prophet = joblib.load(filepath)
        future = model.make_future_dataframe(periods=days_ahead)
        forecast = model.predict(future)

        # Ambil hanya data prediksi ke depan
        result = forecast.tail(days_ahead)[["ds", "yhat"]]
        result["yhat"] = result["yhat"].round(2)

        return {
            "commodity": commodity_name,
            "market": market_location,
            "days_ahead": days_ahead,
            "predictions": result.to_dict(orient="records")
        }

    except Exception as e:
        return {"error": f"Gagal memprediksi harga: {str(e)}"}
