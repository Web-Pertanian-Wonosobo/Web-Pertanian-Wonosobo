# Weather Interpolation Service
# Untuk generate data cuaca estimasi untuk kecamatan yang tidak punya data BMKG

import logging
from typing import Dict, List, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.weather_model import WeatherData
import math

logger = logging.getLogger(__name__)

# === Koordinat geografis kecamatan di Wonosobo (lat, lon) ===
KECAMATAN_COORDINATES = {
    # Kecamatan dengan data BMKG (reference points)
    "WADASLINTANG": (-7.4789, 109.9156),
    "KALIBAWANG": (-7.3567, 109.9234),
    
    # Kecamatan lain yang perlu interpolasi
    "KEJAJAR": (-7.2833, 109.9167),
    "GARUNG": (-7.3667, 109.9833),
    "LEKSONO": (-7.3833, 109.9333),
    "KALIWIRO": (-7.4000, 109.9333),
    "SAPURAN": (-7.4167, 109.9500),
    "KEPIL": (-7.4333, 109.9500),
    "KALIKAJAR": (-7.3500, 109.9500),
    "KERTEK": (-7.3500, 110.0000),
    "WONOSOBO": (-7.3667, 110.0000),
    "MOJOTENGAH": (-7.3833, 110.0167),
    "SELOMERTO": (-7.4000, 109.9667),
    "SUKOHARJO": (-7.3333, 109.9667),
    "WATUMALANG": (-7.3833, 110.0333),
}

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Hitung jarak antara dua koordinat menggunakan Haversine formula (dalam km)
    """
    R = 6371  # Radius bumi dalam km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def find_nearest_locations(target_location: str, available_locations: List[str], k: int = 3) -> List[tuple]:
    """
    Cari k kecamatan terdekat dari target location
    Returns: List of (location_name, distance)
    """
    if target_location.upper() not in KECAMATAN_COORDINATES:
        logger.warning(f"Location {target_location} not found in coordinates database")
        return []
    
    target_coords = KECAMATAN_COORDINATES[target_location.upper()]
    distances = []
    
    for loc in available_locations:
        loc_upper = loc.upper()
        if loc_upper in KECAMATAN_COORDINATES and loc_upper != target_location.upper():
            loc_coords = KECAMATAN_COORDINATES[loc_upper]
            distance = calculate_distance(
                target_coords[0], target_coords[1],
                loc_coords[0], loc_coords[1]
            )
            distances.append((loc, distance))
    
    # Sort by distance dan ambil k terdekat
    distances.sort(key=lambda x: x[1])
    return distances[:k]

def interpolate_weather_data(
    db: Session,
    target_location: str,
    target_date: date,
    k: int = 3
) -> Optional[Dict]:
    """
    Interpolasi data cuaca untuk lokasi yang tidak punya data BMKG
    Menggunakan Inverse Distance Weighting (IDW) dari k lokasi terdekat
    
    Args:
        db: Database session
        target_location: Nama kecamatan yang perlu data cuaca
        target_date: Tanggal yang ingin diinterpolasi
        k: Jumlah lokasi terdekat yang digunakan untuk interpolasi
    
    Returns:
        Dictionary dengan data cuaca terinteprolasi atau None jika gagal
    """
    try:
        # Cek apakah target location sudah punya data real
        existing_data = db.query(WeatherData).filter(
            WeatherData.location_name == target_location,
            WeatherData.date == target_date
        ).first()
        
        if existing_data:
            # Sudah ada data real, tidak perlu interpolasi
            return None
        
        # Ambil semua lokasi yang punya data untuk tanggal tersebut
        available_data = db.query(WeatherData).filter(
            WeatherData.date == target_date
        ).all()
        
        if not available_data:
            logger.warning(f"No weather data available for date {target_date}")
            return None
        
        available_locations = list(set([d.location_name for d in available_data]))
        
        # Cari lokasi terdekat
        nearest = find_nearest_locations(target_location, available_locations, k)
        
        if not nearest:
            logger.warning(f"Cannot find nearest locations for {target_location}")
            return None
        
        # Hitung bobot berdasarkan inverse distance
        total_weight = 0
        weighted_temp = 0
        weighted_humidity = 0
        weighted_rainfall = 0
        weighted_wind = 0
        
        for loc_name, distance in nearest:
            # Ambil data cuaca dari lokasi terdekat
            loc_data = db.query(WeatherData).filter(
                WeatherData.location_name == loc_name,
                WeatherData.date == target_date
            ).first()
            
            if loc_data:
                # IDW: bobot = 1/distance^2 (semakin dekat semakin besar bobotnya)
                # Tambah small constant untuk avoid division by zero
                weight = 1 / ((distance + 0.1) ** 2)
                total_weight += weight
                
                weighted_temp += (loc_data.temperature or 0) * weight
                weighted_humidity += (loc_data.humidity or 0) * weight
                weighted_rainfall += (loc_data.rainfall or 0) * weight
                weighted_wind += (loc_data.wind_speed or 0) * weight
        
        if total_weight == 0:
            return None
        
        # Hitung nilai interpolasi
        interpolated_temp = weighted_temp / total_weight
        interpolated_humidity = weighted_humidity / total_weight
        interpolated_rainfall = weighted_rainfall / total_weight
        interpolated_wind = weighted_wind / total_weight
        
        # Tentukan kondisi cuaca
        condition = (
            "Hujan Lebat" if interpolated_rainfall > 15
            else "Hujan Ringan" if interpolated_rainfall > 5
            else "Cerah" if interpolated_temp > 20
            else "Dingin"
        )
        
        risk = (
            "Tinggi" if interpolated_rainfall > 15
            else "Sedang" if interpolated_rainfall > 5
            else "Rendah"
        )
        
        result = {
            "date": target_date.isoformat(),
            "location_name": target_location,
            "temperature": round(interpolated_temp, 1),
            "humidity": round(interpolated_humidity, 1),
            "rainfall": round(interpolated_rainfall, 1),
            "wind_speed": round(interpolated_wind, 1),
            "condition": condition,
            "risk": risk,
            "is_interpolated": True,
            "interpolation_sources": [loc for loc, _ in nearest],
            "interpolation_method": f"IDW (k={k})"
        }
        
        logger.info(f"✅ Interpolated weather for {target_location} on {target_date} using {len(nearest)} sources")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error interpolating weather data: {e}")
        return None

def get_or_interpolate_weather(
    db: Session,
    location: str,
    target_date: date
) -> Optional[Dict]:
    """
    Get weather data - gunakan data real jika ada, interpolasi jika tidak ada
    """
    # Coba ambil data real dulu
    real_data = db.query(WeatherData).filter(
        WeatherData.location_name == location,
        WeatherData.date == target_date
    ).first()
    
    if real_data:
        return {
            "date": real_data.date.isoformat(),
            "location_name": real_data.location_name,
            "temperature": round(float(real_data.temperature or 0), 1),
            "humidity": round(float(real_data.humidity or 0), 1),
            "rainfall": round(float(real_data.rainfall or 0), 1),
            "wind_speed": round(float(real_data.wind_speed or 0), 1),
            "condition": (
                "Hujan Lebat" if (real_data.rainfall or 0) > 15
                else "Hujan Ringan" if (real_data.rainfall or 0) > 5
                else "Cerah" if (real_data.temperature or 0) > 20
                else "Dingin"
            ),
            "risk": (
                "Tinggi" if (real_data.rainfall or 0) > 15
                else "Sedang" if (real_data.rainfall or 0) > 5
                else "Rendah"
            ),
            "is_interpolated": False
        }
    
    # Jika tidak ada data real, lakukan interpolasi
    return interpolate_weather_data(db, location, target_date)

def bulk_interpolate_missing_locations(
    db: Session,
    target_date: date,
    all_locations: List[str]
) -> List[Dict]:
    """
    Interpolasi cuaca untuk semua lokasi yang tidak punya data pada tanggal tertentu
    """
    results = []
    
    for location in all_locations:
        weather_data = get_or_interpolate_weather(db, location, target_date)
        if weather_data:
            results.append(weather_data)
    
    return results
