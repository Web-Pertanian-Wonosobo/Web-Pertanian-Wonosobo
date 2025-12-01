import requests
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging
import numpy as np
import traceback
import os

from app.models.weather_model import WeatherData, WeatherPrediction

# === Helper: Normalisasi base URL OpenWeather ===
def _get_base_url() -> str:
    raw = os.getenv("OPENWEATHER_BASE_URL", "https://api.openweathermap.org/data/2.5").strip()
    # Jika domain tidak mengandung openweathermap.org, paksa default yang benar
    if "openweathermap.org" not in raw:
        logging.warning(f"⚠️ OPENWEATHER_BASE_URL invalid ('{raw}'), forcing default")
        return "https://api.openweathermap.org/data/2.5"
    # Hilangkan trailing slash
    return raw.rstrip('/')

# === Coba import Prophet ===
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
    logging.info("✅ Prophet ML library loaded successfully")
except Exception:
    PROPHET_AVAILABLE = False
    logging.info("ℹ️ Prophet not available. Using Simple Moving Average fallback.")


# 🌦 Daftar kecamatan di Wonosobo (koordinat untuk OpenWeather API)
DISTRICTS = [
    {"name": "Wadaslintang", "lat": -7.5167, "lon": 109.9167},
    {"name": "Kalikajar", "lat": -7.3833, "lon": 109.7500},
    {"name": "Wonosobo Kota", "lat": -7.3667, "lon": 109.9000},
    {"name": "Leksono", "lat": -7.3833, "lon": 109.8500},
    {"name": "Kertek", "lat": -7.4167, "lon": 109.8833},
    {"name": "Garung", "lat": -7.4500, "lon": 109.8667},
    {"name": "Kaliwiro", "lat": -7.4333, "lon": 109.8167},
    {"name": "Kalibawang", "lat": -7.4833, "lon": 109.8833},
    {"name": "Selomerto", "lat": -7.4667, "lon": 109.9167},
    {"name": "Kejajar", "lat": -7.3500, "lon": 109.8000},
    {"name": "Mojotengah", "lat": -7.4000, "lon": 109.9500},
]


# === 1️⃣ Ambil data cuaca dari OpenWeather API ===
def fetch_weather_data():
    all_records = []
    api_key = os.getenv("OPENWEATHER_API_KEY")
    base_url = _get_base_url()
    
    if not api_key:
        raise ValueError("❌ OPENWEATHER_API_KEY tidak ditemukan di environment variables")

    for d in DISTRICTS:
        try:
            # Current weather
            current_url = f"{base_url}/weather?lat={d['lat']}&lon={d['lon']}&appid={api_key}&units=metric"
            logging.debug(f"→ Fetch current: {current_url}")
            current_res = requests.get(current_url, timeout=10)
            current_res.raise_for_status()
            current_data = current_res.json()
            
            # Add current weather record
            current_record = {
                "ds": datetime.now(),
                "temperature": float(current_data["main"]["temp"]),
                "humidity": float(current_data["main"]["humidity"]),
                "rainfall": float(current_data.get("rain", {}).get("1h", 0)),
                "wind_speed": float(current_data["wind"]["speed"]) * 3.6,  # Convert m/s to km/h
                "location": d["name"]
            }
            all_records.append(current_record)
            
            # 5-day forecast
            forecast_url = f"{base_url}/forecast?lat={d['lat']}&lon={d['lon']}&appid={api_key}&units=metric"
            logging.debug(f"→ Fetch forecast: {forecast_url}")
            forecast_res = requests.get(forecast_url, timeout=10)
            forecast_res.raise_for_status()
            forecast_data = forecast_res.json()
            
            # Process forecast data (every 3 hours for 5 days)
            for forecast in forecast_data.get("list", []):
                forecast_record = {
                    "ds": datetime.fromtimestamp(forecast["dt"]),
                    "temperature": float(forecast["main"]["temp"]),
                    "humidity": float(forecast["main"]["humidity"]),
                    "rainfall": float(forecast.get("rain", {}).get("3h", 0)),
                    "wind_speed": float(forecast["wind"]["speed"]) * 3.6,  # Convert m/s to km/h
                    "location": d["name"]
                }
                all_records.append(forecast_record)

            logging.info(f"✅ {d['name']}: berhasil ambil data dari OpenWeather")

        except requests.exceptions.RequestException as e:
            logging.warning(f"⚠️ Gagal ambil {d['name']}: {e}")
        except Exception as e:
            logging.debug(f"⚠️ Gagal parsing {d['name']}: {traceback.format_exc()}")

    df = pd.DataFrame(all_records)
    if df.empty:
        # Fallback mock agar server tetap jalan
        logging.warning("ℹ️ OpenWeather kosong/401 – mengembalikan mock data untuk pengujian.")
        now = datetime.now()
        mock = []
        for d in DISTRICTS:
            mock.append({
                "ds": now,
                "temperature": 23.0,
                "humidity": 80.0,
                "rainfall": 2.0,
                "wind_speed": 10.0,
                "location": d["name"],
            })
        df = pd.DataFrame(mock)

    df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
    df = df.dropna(subset=["ds", "temperature"])
    return df


# === 1️⃣A Ambil data cuaca berdasarkan koordinat spesifik ===
def fetch_weather_by_coordinates(lat: float, lon: float, location_name: str = None):
    """Ambil data cuaca (current + 5-day forecast) untuk koordinat spesifik dari OpenWeather API"""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    base_url = _get_base_url()

    if not api_key:
        raise ValueError("❌ OPENWEATHER_API_KEY tidak ditemukan di environment variables")

    location_name = location_name or f"Lat{lat}_Lon{lon}"  # Nama fallback
    all_records = []

    try:
        # Current weather
        current_url = f"{base_url}/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        logging.debug(f"→ Fetch current by coords: {current_url}")
        current_res = requests.get(current_url, timeout=10)
        if current_res.status_code == 401:
            logging.warning("ℹ️ OpenWeather 401 untuk current – gunakan mock data.")
            all_records.append({
                "ds": datetime.now(),
                "temperature": 23.0,
                "humidity": 80.0,
                "rainfall": 2.0,
                "wind_speed": 10.0,
                "location": location_name
            })
        else:
            current_res.raise_for_status()
            current_data = current_res.json()
            
            current_record = {
                "ds": datetime.now(),
                "temperature": float(current_data["main"]["temp"]),
                "humidity": float(current_data["main"]["humidity"]),
                "rainfall": float(current_data.get("rain", {}).get("1h", 0)),
                "wind_speed": float(current_data["wind"]["speed"]) * 3.6,
                "location": location_name
            }
            all_records.append(current_record)

        # 5-day / 3-hour forecast
        forecast_url = f"{base_url}/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        logging.debug(f"→ Fetch forecast by coords: {forecast_url}")
        forecast_res = requests.get(forecast_url, timeout=10)
        if forecast_res.status_code == 401:
            logging.warning("ℹ️ OpenWeather 401 untuk forecast – gunakan mock points.")
            base_time = datetime.now()
            for i in range(1, 6):
                all_records.append({
                    "ds": base_time + timedelta(days=i),
                    "temperature": 23.0 + i * 0.2,
                    "humidity": 78.0,
                    "rainfall": 2.0,
                    "wind_speed": 10.0,
                    "location": location_name
                })
        else:
            forecast_res.raise_for_status()
            forecast_data = forecast_res.json()
            
            for fc in forecast_data.get("list", []):
                fc_record = {
                    "ds": datetime.fromtimestamp(fc["dt"]),
                    "temperature": float(fc["main"]["temp"]),
                    "humidity": float(fc["main"]["humidity"]),
                    "rainfall": float(fc.get("rain", {}).get("3h", 0)),
                    "wind_speed": float(fc["wind"]["speed"]) * 3.6,
                    "location": location_name
                }
                all_records.append(fc_record)

        logging.info(f"✅ {location_name} ({lat}, {lon}) berhasil fetch data OpenWeather")

        df = pd.DataFrame(all_records)
        if df.empty:
            logging.warning("ℹ️ Tidak ada data – mengembalikan 1 mock record.")
            df = pd.DataFrame([{
                "ds": datetime.now(),
                "temperature": 23.0,
                "humidity": 80.0,
                "rainfall": 2.0,
                "wind_speed": 10.0,
                "location": location_name
            }])

        df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
        df = df.dropna(subset=["ds", "temperature"])
        return df

    except requests.exceptions.RequestException as e:
        logging.warning(f"⚠️ Gagal request OpenWeather untuk {location_name}: {e}")
        raise
    except Exception as e:
        logging.debug(f"⚠️ Error parsing OpenWeather response {location_name}: {traceback.format_exc()}")
        raise


# === 2️⃣ Simpan data ke DB ===
def save_weather_data(db: Session, df: pd.DataFrame):
    saved = 0
    for _, row in df.iterrows():
        try:
            record = WeatherData(
                date=row["ds"].date(),
                location_name=row.get("location", "OpenWeather"),
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
    logging.info(f"✅ Berhasil simpan {saved} data dari {df['location'].nunique()} kecamatan (OpenWeather).")


# === 3️⃣ Fallback prediksi sederhana berdasarkan koordinat ===
def predict_weather_simple_by_coordinates(db: Session, lat: float, lon: float, location_name: str = None, days_ahead: int = 3):
    """Simple Moving Average untuk koordinat spesifik"""
    location_name = location_name or f"Lat{lat}_Lon{lon}"
    logging.info(f"🔄 Menggunakan Simple Moving Average untuk {location_name}...")
    
    query = db.query(WeatherData).filter(WeatherData.location_name == location_name)
    data = query.order_by(WeatherData.date).all()
    
    if not data:
        logging.info(f"⚠️ Tidak ada data di DB untuk {location_name}, mengambil dari OpenWeather...")
        try:
            df = fetch_weather_by_coordinates(lat, lon, location_name)
            save_weather_data(db, df)
            data = db.query(WeatherData).filter(WeatherData.location_name == location_name).order_by(WeatherData.date).all()
        except Exception as e:
            logging.error(f"❌ Gagal mengambil data dari OpenWeather: {e}")
            raise ValueError(f"Tidak dapat mengambil data cuaca untuk koordinat {lat}, {lon}")
    
    df = pd.DataFrame([{"date": d.date, "temperature": d.temperature} for d in data if d.temperature is not None])
    if df.empty:
        raise ValueError(f"❌ Tidak ada data suhu yang valid untuk {location_name}.")
    
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
            source=f"SMA (OpenWeather Direct) - {location_name}"
        )
        db.add(pred)
        preds.append(pred)
    
    db.commit()
    logging.info(f"✅ Generated {len(preds)} prediksi SMA untuk {location_name}.")
    return preds

# === 3️⃣A Fallback prediksi sederhana (legacy) ===
def predict_weather_simple(db: Session, days_ahead: int = 3, location: str = None):
    """Legacy Simple Moving Average function"""
    logging.info("🔄 Menggunakan Simple Moving Average untuk prediksi cuaca...")

    query = db.query(WeatherData)
    if location:
        query = query.filter(WeatherData.location_name == location)
    data = query.order_by(WeatherData.date).all()

    if not data:
        logging.info("⚠️ Tidak ada data di DB, mengambil dari OpenWeather...")
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


# === 4️⃣ Prediksi cuaca berdasarkan koordinat (tanpa interpolasi) ===
def predict_weather_by_coordinates(db: Session, lat: float, lon: float, location_name: str = None, days_ahead: int = 3):
    """
    Prediksi cuaca berdasarkan koordinat spesifik langsung dari OpenWeather API.
    Tidak menggunakan interpolasi, langsung ambil data dari koordinat yang diminta.
    """
    if not PROPHET_AVAILABLE:
        return predict_weather_simple_by_coordinates(db, lat, lon, location_name, days_ahead)
    
    location_name = location_name or f"Lat{lat}_Lon{lon}"
    logging.info(f"🔄 Mulai prediksi untuk koordinat {lat}, {lon} ({location_name})")
    
    # Cek data historis untuk koordinat ini
    query = db.query(WeatherData).filter(WeatherData.location_name == location_name)
    data = query.order_by(WeatherData.date).all()
    
    # Jika tidak ada data historis, ambil data fresh dari OpenWeather
    if not data:
        logging.info(f"⚠️ Tidak ada data historis untuk {location_name}, mengambil data fresh dari OpenWeather...")
        try:
            df_fresh = fetch_weather_by_coordinates(lat, lon, location_name)
            save_weather_data(db, df_fresh)
            # Query ulang setelah save
            data = db.query(WeatherData).filter(WeatherData.location_name == location_name).order_by(WeatherData.date).all()
        except Exception as e:
            logging.error(f"❌ Gagal mengambil data dari OpenWeather untuk {location_name}: {e}")
            raise ValueError(f"Tidak dapat mengambil data cuaca untuk koordinat {lat}, {lon}")
    
    # Convert ke dataframe untuk Prophet
    df = pd.DataFrame([{"ds": d.date, "y": d.temperature} for d in data if d.temperature is not None])
    
    if df.empty:
        raise ValueError(f"❌ Tidak ada data suhu yang valid untuk {location_name}.")
    
    # Jika data terlalu sedikit, tambah data fresh
    if len(df) < 5:
        logging.info(f"⚠️ Data historis terbatas ({len(df)} records), menambah data fresh...")
        try:
            df_fresh = fetch_weather_by_coordinates(lat, lon, location_name)
            save_weather_data(db, df_fresh)
            # Query ulang
            data = db.query(WeatherData).filter(WeatherData.location_name == location_name).order_by(WeatherData.date).all()
            df = pd.DataFrame([{"ds": d.date, "y": d.temperature} for d in data if d.temperature is not None])
        except Exception as e:
            logging.warning(f"⚠️ Gagal menambah data fresh: {e}")
    
    try:
        # Training Prophet model
        model = Prophet(
            daily_seasonality=False,
            yearly_seasonality=False,
            weekly_seasonality=False,
        )
        model.fit(df)
        
        # Prediksi untuk beberapa hari ke depan
        future = model.make_future_dataframe(periods=days_ahead, freq="D")
        forecast = model.predict(future)
        
        # Ambil hasil prediksi
        results = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(days_ahead)
        preds = []
        
        for _, row in results.iterrows():
            pred = WeatherPrediction(
                date=row["ds"].date(),
                predicted_temp=float(row["yhat"]),
                lower_bound=float(row["yhat_lower"]),
                upper_bound=float(row["yhat_upper"]),
                source=f"Prophet ML (OpenWeather Direct) - {location_name}"
            )
            db.add(pred)
            preds.append(pred)
        
        db.commit()
        logging.info(f"✅ Prophet sukses untuk {location_name} dengan {len(df)} data points historis.")
        return preds
        
    except Exception as e:
        logging.warning(f"⚠️ Prophet gagal untuk {location_name} ({e}), fallback ke SMA")
        traceback.print_exc()
        db.rollback()
        return predict_weather_simple_by_coordinates(db, lat, lon, location_name, days_ahead)

# === 4️⃣A Prediksi cuaca dengan Prophet (legacy untuk backward compatibility) ===
def predict_weather(db: Session, days_ahead: int = 3, location: str = None):
    """
    Legacy function - tetap ada untuk backward compatibility.
    Untuk prediksi baru, gunakan predict_weather_by_coordinates().
    """
    if not PROPHET_AVAILABLE:
        return predict_weather_simple(db, days_ahead, location)
    
    # Jika ada location yang cocok dengan DISTRICTS, gunakan koordinatnya
    for district in DISTRICTS:
        if location and district["name"].lower() == location.lower():
            logging.info(f"🔄 Menggunakan koordinat untuk {location}: {district['lat']}, {district['lon']}")
            return predict_weather_by_coordinates(db, district["lat"], district["lon"], location, days_ahead)
    
    # Fallback ke metode lama jika tidak ada koordinat yang cocok
    query = db.query(WeatherData)
    if location:
        query = query.filter(WeatherData.location_name == location)
    data = query.order_by(WeatherData.date).all()
    
    # Jika tidak ada data, fetch dari semua district
    if not data:
        logging.info(f"⚠️ Tidak ada data untuk {location or 'semua lokasi'}, fetch dari OpenWeather...")
        df_fetch = fetch_weather_data()
        save_weather_data(db, df_fetch)
        query = db.query(WeatherData)
        if location:
            query = query.filter(WeatherData.location_name == location)
        data = query.order_by(WeatherData.date).all()
    
    # Convert to dataframe
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
        
        for _, row in results.iterrows():
            pred = WeatherPrediction(
                date=row["ds"].date(),
                predicted_temp=float(row["yhat"]),
                lower_bound=float(row["yhat_lower"]),
                upper_bound=float(row["yhat_upper"]),
                source=f"Prophet ML (OpenWeather) - {location or 'Global'}"
            )
            db.add(pred)
            preds.append(pred)
        
        db.commit()
        logging.info(f"✅ Prophet sukses untuk {location or 'semua lokasi'}.")
        return preds
        
    except Exception as e:
        logging.warning(f"⚠️ Prophet gagal ({e}), fallback ke SMA")
        traceback.print_exc()
        db.rollback()
        return predict_weather_simple(db, days_ahead, location)
