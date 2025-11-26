import requests
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging
import numpy as np
import traceback

from app.models.weather_model import WeatherData, WeatherPrediction

# === Coba import Prophet ===
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
    logging.info("✅ Prophet ML library loaded successfully")
except Exception:
    PROPHET_AVAILABLE = False
    logging.info("ℹ️ Prophet not available. Using Simple Moving Average fallback.")


# 🌦 Daftar kecamatan di Wonosobo (kode adm4 BMKG)
DISTRICTS = [
    {"name": "Wadaslintang", "adm4": "33.07.01.2001"},
    {"name": "Kalikajar", "adm4": "33.07.02.1001"},
    {"name": "Wonosobo Kota", "adm4": "33.07.03.1001"},
    {"name": "Leksono", "adm4": "33.07.04.1001"},
    {"name": "Kertek", "adm4": "33.07.05.1001"},
    {"name": "Garung", "adm4": "33.07.06.1001"},
    {"name": "Kaliwiro", "adm4": "33.07.07.1001"},
    {"name": "Kalibawang", "adm4": "33.07.08.1001"},
    {"name": "Selomerto", "adm4": "33.07.09.1001"},
    {"name": "Kejajar", "adm4": "33.07.10.1001"},
    {"name": "Mojotengah", "adm4": "33.07.11.1001"},
]


# === 1️⃣ Ambil data cuaca dari semua kecamatan yang valid ===
def fetch_weather_data():
    all_records = []

    for d in DISTRICTS:
        try:
            url = f"https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={d['adm4']}"
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            data = res.json()

            cuaca_list = []
            for item in data.get("data", []):
                if "cuaca" in item:
                    cuaca_list.extend(item["cuaca"])

            if not cuaca_list:
                logging.warning(f"⚠️ Tidak ada data untuk {d['name']}")
                continue

            for fset in cuaca_list:
                for f in fset:
                    all_records.append({
                        "ds": f.get("datetime"),
                        "temperature": float(f.get("t", 0)),
                        "humidity": float(f.get("hu", 0)),
                        "rainfall": float(f.get("tp", 0)),
                        "wind_speed": float(f.get("ws", 0)),
                        "location": d["name"]
                    })

            logging.info(f"✅ {d['name']}: berhasil ambil {len(cuaca_list)} entri")

        except requests.exceptions.RequestException as e:
            # Suppress 404 warnings - only log if it's not a 404
            if "404" not in str(e):
                logging.warning(f"⚠️ Gagal ambil {d['name']}: {e}")
        except Exception as e:
            logging.debug(f"⚠️ Gagal parsing {d['name']}: {traceback.format_exc()}")

    df = pd.DataFrame(all_records)
    if df.empty:
        raise ValueError("❌ Tidak ada data BMKG yang berhasil diambil.")

    df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
    df = df.dropna(subset=["ds", "temperature"])
    return df


# === 2️⃣ Simpan data ke DB ===
def save_weather_data(db: Session, df: pd.DataFrame):
    saved = 0
    for _, row in df.iterrows():
        try:
            record = WeatherData(
                date=row["ds"].date(),
                location_name=row.get("location", "BMKG"),
                temperature=row.get("temperature"),
                humidity=row.get("humidity"),
                rainfall=row.get("rainfall"),
                wind_speed=row.get("wind_speed"),
            )
            db.add(record)
            saved += 1
        except Exception as e:
            logging.warning(f"⚠️ Gagal simpan record: {e}")

    db.commit()
    logging.info(f"✅ Berhasil simpan {saved} data dari {df['location'].nunique()} kecamatan.")


# === 3️⃣ Fallback prediksi sederhana (SMA) ===
def predict_weather_simple(db: Session, days_ahead: int = 3, location: str = None):
    logging.info("🔄 Menggunakan Simple Moving Average untuk prediksi cuaca...")

    query = db.query(WeatherData)
    if location:
        query = query.filter(WeatherData.location_name == location)
    data = query.order_by(WeatherData.date).all()

    if not data:
        logging.info("⚠️ Tidak ada data di DB, mengambil dari BMKG...")
        df = fetch_weather_data()
        save_weather_data(db, df)
        query = db.query(WeatherData)
        if location:
            query = query.filter(WeatherData.location_name == location)
        data = query.order_by(WeatherData.date).all()

    df = pd.DataFrame([{"date": d.date, "temperature": d.temperature} for d in data if d.temperature is not None])
    if df.empty:
        raise ValueError(f"❌ Tidak ada data historis untuk lokasi {location or 'semua lokasi'}.")

    # Hitung rata-rata & deviasi standar suhu terakhir
    window = min(7, len(df))
    avg_temp = np.mean(df.tail(window)["temperature"])
    std_temp = np.std(df.tail(window)["temperature"])
    last_date = df["date"].max()

    preds = []
    for i in range(1, days_ahead + 1):
        pred_date = last_date + timedelta(days=i)
        pred = WeatherPrediction(
            date=pred_date,
            predicted_temp=round(avg_temp, 2),
            lower_bound=round(avg_temp - std_temp, 2),
            upper_bound=round(avg_temp + std_temp, 2),
            source=f"SMA - {location or 'Global'}"
        )
        db.add(pred)
        preds.append(pred)

    db.commit()
    logging.info(f"✅ Generated {len(preds)} prediksi sederhana untuk {location or 'semua lokasi'}.")
    return preds


# === 4️⃣ Prediksi cuaca dengan Prophet (utama) ===
def predict_weather(db: Session, days_ahead: int = 3, location: str = None):
    """
    Prediksi cuaca untuk lokasi tertentu atau global.
    Jika lokasi tidak punya data historis, akan menggunakan interpolasi dari lokasi terdekat.
    """
    if not PROPHET_AVAILABLE:
        return predict_weather_simple(db, days_ahead, location)

    # Import interpolation service
    try:
        from app.services.weather_interpolation import (
            find_nearest_locations,
            KECAMATAN_COORDINATES
        )
        INTERPOLATION_AVAILABLE = True
    except Exception:
        INTERPOLATION_AVAILABLE = False
        logging.warning("⚠️ Weather interpolation service not available")

    query = db.query(WeatherData)
    if location:
        query = query.filter(WeatherData.location_name == location)
    data = query.order_by(WeatherData.date).all()

    # Jika tidak ada data untuk lokasi spesifik, coba interpolasi
    if not data and location and INTERPOLATION_AVAILABLE:
        logging.info(f"🔄 Tidak ada data historis untuk {location}, mencoba interpolasi...")
        
        # Dapatkan lokasi dengan data yang tersedia
        available_locations = db.query(WeatherData.location_name).distinct().all()
        available_locations = [loc[0] for loc in available_locations]
        
        if available_locations:
            # Cari 3 lokasi terdekat yang punya data
            nearest = find_nearest_locations(location, available_locations, k=3)
            
            if nearest:
                logging.info(f"📍 Menggunakan data dari: {[loc for loc, _ in nearest]}")
                
                # Gabungkan data dari lokasi terdekat dengan bobot
                all_data = []
                total_weight = 0
                
                for loc_name, distance in nearest:
                    loc_data = db.query(WeatherData).filter(
                        WeatherData.location_name == loc_name
                    ).order_by(WeatherData.date).all()
                    
                    # Bobot berdasarkan inverse distance
                    weight = 1 / ((distance + 0.1) ** 2)
                    total_weight += weight
                    
                    for d in loc_data:
                        if d.temperature is not None:
                            all_data.append({
                                "ds": d.date,
                                "y": d.temperature * weight,
                                "weight": weight
                            })
                
                if all_data:
                    # Aggregate weighted temperatures by date
                    df_weighted = pd.DataFrame(all_data)
                    
                    # Group by date and calculate weighted average properly
                    df_grouped = df_weighted.groupby("ds").apply(
                        lambda x: pd.Series({
                            "y": x["y"].sum() / x["weight"].sum()  # Proper weighted average
                        })
                    ).reset_index()
                    
                    df = df_grouped
                    
                    logging.info(f"✅ Berhasil membuat dataset interpolasi untuk {location} dengan {len(df)} data points")
                    logging.info(f"📊 Temperature range: {df['y'].min():.1f}°C - {df['y'].max():.1f}°C")
                    data = "interpolated"  # Flag untuk menandai data interpolasi

    # Jika masih tidak ada data, fetch dari BMKG
    if not data:
        logging.info(f"⚠️ Tidak ada data untuk {location or 'semua lokasi'}, fetch ulang dari BMKG...")
        df_fetch = fetch_weather_data()
        save_weather_data(db, df_fetch)
        query = db.query(WeatherData)
        if location:
            query = query.filter(WeatherData.location_name == location)
        data = query.order_by(WeatherData.date).all()

    # Convert to dataframe jika belum di-interpolasi
    if data != "interpolated":
        df = pd.DataFrame([{"ds": d.date, "y": d.temperature} for d in data if d.temperature is not None])
    
    if df.empty:
        raise ValueError(f"❌ Tidak ada data historis untuk {location or 'semua lokasi'}.")

    try:
        model = Prophet(
            daily_seasonality=False,
            yearly_seasonality=False,
            weekly_seasonality=False,
        )
        model.fit(df)
        future = model.make_future_dataframe(periods=days_ahead, freq="D")
        forecast = model.predict(future)

        results = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(days_ahead)
        preds = []
        
        # Tentukan source berdasarkan apakah data di-interpolasi atau tidak
        is_interpolated = (data == "interpolated")
        source_suffix = " (Interpolated)" if is_interpolated else ""
        
        for _, row in results.iterrows():
            pred = WeatherPrediction(
                date=row["ds"].date(),
                predicted_temp=float(row["yhat"]),
                lower_bound=float(row["yhat_lower"]),
                upper_bound=float(row["yhat_upper"]),
                source=f"Prophet ML{source_suffix} - {location or 'Global'}"
            )
            db.add(pred)
            preds.append(pred)

        db.commit()
        logging.info(f"✅ Prophet sukses untuk {location or 'semua lokasi'}{source_suffix}.")
        return preds

    except Exception as e:
        logging.warning(f"⚠️ Prophet gagal ({e}), fallback ke SMA untuk {location or 'global'}")
        traceback.print_exc()
        db.rollback()
        return predict_weather_simple(db, days_ahead, location)
