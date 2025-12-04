# Crop Recommendation Service
# Memberikan rekomendasi komoditas pangan berdasarkan prediksi cuaca

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

# === Data Komoditas Pangan Wonosobo ===
CROPS_DATABASE = {
    "padi": {
        "name": "Padi",
        "category": "Biji-bijian",
        "temp_optimal": (22, 28),  # Celsius
        "temp_tolerance": (18, 32),
        "rainfall_optimal": (150, 250),  # mm per bulan
        "rainfall_tolerance": (100, 350),
        "growth_period": 120,  # hari
        "season_preference": ["musim_hujan"],
        "humidity_optimal": (70, 85),  # %
        "economic_value": "tinggi",
        "difficulty": "sedang",
        "description": "Tanaman pangan utama dengan hasil tinggi di dataran rendah-menengah"
    },
    "jagung": {
        "name": "Jagung",
        "category": "Biji-bijian", 
        "temp_optimal": (20, 28),
        "temp_tolerance": (16, 35),
        "rainfall_optimal": (85, 150),
        "rainfall_tolerance": (60, 200),
        "growth_period": 90,
        "season_preference": ["musim_kemarau", "peralihan"],
        "humidity_optimal": (60, 75),
        "economic_value": "tinggi",
        "difficulty": "mudah",
        "description": "Tahan kekeringan, cocok musim kemarau, nilai ekonomi tinggi"
    },
    "kacang_tanah": {
        "name": "Kacang Tanah",
        "category": "Kacang-kacangan",
        "temp_optimal": (22, 30),
        "temp_tolerance": (18, 35),
        "rainfall_optimal": (50, 120),
        "rainfall_tolerance": (40, 150),
        "growth_period": 90,
        "season_preference": ["musim_kemarau"],
        "humidity_optimal": (60, 70),
        "economic_value": "sedang",
        "difficulty": "mudah",
        "description": "Protein nabati tinggi, tahan kekeringan, rotasi tanaman baik"
    },
    "kedelai": {
        "name": "Kedelai", 
        "category": "Kacang-kacangan",
        "temp_optimal": (23, 27),
        "temp_tolerance": (20, 30),
        "rainfall_optimal": (100, 150),
        "rainfall_tolerance": (80, 180),
        "growth_period": 80,
        "season_preference": ["peralihan", "musim_kemarau"],
        "humidity_optimal": (65, 75),
        "economic_value": "tinggi",
        "difficulty": "sedang",
        "description": "Sumber protein tinggi, pasar stabil, cocok rotasi dengan padi"
    },
    "cabai": {
        "name": "Cabai Rawit/Merah",
        "category": "Sayuran",
        "temp_optimal": (20, 26),
        "temp_tolerance": (18, 30),
        "rainfall_optimal": (60, 120),
        "rainfall_tolerance": (50, 150),
        "growth_period": 75,
        "season_preference": ["musim_kemarau", "peralihan"],
        "humidity_optimal": (55, 70),
        "economic_value": "sangat_tinggi",
        "difficulty": "sedang",
        "description": "Nilai ekonomi sangat tinggi, permintaan konsisten, cocok dataran tinggi Wonosobo"
    },
    "tomat": {
        "name": "Tomat",
        "category": "Sayuran",
        "temp_optimal": (18, 24),
        "temp_tolerance": (15, 28),
        "rainfall_optimal": (60, 100),
        "rainfall_tolerance": (40, 130),
        "growth_period": 90,
        "season_preference": ["musim_kemarau"],
        "humidity_optimal": (50, 65),
        "economic_value": "tinggi",
        "difficulty": "sedang",
        "description": "Cocok iklim sejuk Wonosobo, pasar luas, bisa hidroponik"
    },
    "kentang": {
        "name": "Kentang",
        "category": "Umbi-umbian",
        "temp_optimal": (15, 22),
        "temp_tolerance": (12, 25),
        "rainfall_optimal": (80, 120),
        "rainfall_tolerance": (60, 150),
        "growth_period": 90,
        "season_preference": ["musim_kemarau"],
        "humidity_optimal": (60, 75),
        "economic_value": "tinggi",
        "difficulty": "sedang",
        "description": "Unggulan dataran tinggi Wonosobo, ekspor potensial, margin keuntungan besar"
    },
    "wortel": {
        "name": "Wortel",
        "category": "Sayuran",
        "temp_optimal": (16, 22),
        "temp_tolerance": (13, 25),
        "rainfall_optimal": (70, 110),
        "rainfall_tolerance": (50, 140),
        "growth_period": 75,
        "season_preference": ["musim_kemarau"],
        "humidity_optimal": (65, 75),
        "economic_value": "sedang",
        "difficulty": "mudah",
        "description": "Sayuran sejuk, mudah dibudidayakan, pasar stabil"
    },
    "bawang_daun": {
        "name": "Bawang Daun",
        "category": "Sayuran",
        "temp_optimal": (18, 25),
        "temp_tolerance": (15, 28),
        "rainfall_optimal": (60, 100),
        "rainfall_tolerance": (50, 130),
        "growth_period": 60,
        "season_preference": ["peralihan", "musim_kemarau"],
        "humidity_optimal": (60, 70),
        "economic_value": "sedang",
        "difficulty": "mudah",
        "description": "Cepat panen, permintaan stabil, cocok usaha skala kecil"
    },
    "kol": {
        "name": "Kubis/Kol",
        "category": "Sayuran",
        "temp_optimal": (15, 20),
        "temp_tolerance": (12, 24),
        "rainfall_optimal": (80, 120),
        "rainfall_tolerance": (60, 150),
        "growth_period": 85,
        "season_preference": ["musim_kemarau"],
        "humidity_optimal": (65, 80),
        "economic_value": "sedang",
        "difficulty": "sedang",
        "description": "Sayuran sejuk, pasar tradisional dan modern, tahan simpan"
    }
}

# === Fungsi Utama Rekomendasi ===
def get_crop_recommendations(weather_predictions: List[Dict], location: str = "Wonosobo") -> Dict[str, Any]:
    """
    Menganalisis prediksi cuaca dan memberikan rekomendasi tanaman terbaik
    
    Args:
        weather_predictions: List prediksi cuaca dari AI/ML
        location: Nama lokasi (default: Wonosobo)
    
    Returns:
        Dict dengan rekomendasi tanaman dan analisis
    """
    try:
        # Analisis kondisi cuaca rata-rata
        weather_analysis = analyze_weather_predictions(weather_predictions)
        
        # Score setiap tanaman berdasarkan kondisi cuaca
        crop_scores = []
        for crop_id, crop_data in CROPS_DATABASE.items():
            score = calculate_crop_suitability(crop_data, weather_analysis)
            crop_scores.append({
                "id": crop_id,
                "data": crop_data,
                "score": score,
                "suitability": get_suitability_level(score)
            })
        
        # Urutkan berdasarkan score tertinggi
        crop_scores.sort(key=lambda x: x["score"], reverse=True)
        
        # Kategorikan rekomendasi
        highly_recommended = [c for c in crop_scores if c["score"] >= 80]
        recommended = [c for c in crop_scores if 60 <= c["score"] < 80]
        not_recommended = [c for c in crop_scores if c["score"] < 60]
        
        return {
            "status": "success",
            "location": location,
            "weather_analysis": weather_analysis,
            "recommendations": {
                "highly_recommended": highly_recommended[:3],  # Top 3
                "recommended": recommended[:3],
                "not_recommended": not_recommended[:2]
            },
            "planting_tips": generate_planting_tips(weather_analysis),
            "season_info": determine_season_from_weather(weather_analysis)
        }
        
    except Exception as e:
        logging.error(f"Error in get_crop_recommendations: {e}")
        return {
            "status": "error",
            "message": str(e),
            "recommendations": {"highly_recommended": [], "recommended": [], "not_recommended": []}
        }

def analyze_weather_predictions(predictions: List[Dict]) -> Dict[str, float]:
    """Analisis kondisi cuaca dari prediksi AI/ML"""
    if not predictions:
        return {"avg_temp": 25, "total_rainfall": 50, "avg_humidity": 70}
    
    temps = [p.get("predicted_temp", 0) for p in predictions if p.get("predicted_temp")]
    
    # Estimasi rainfall dan humidity (karena prediksi fokus temperature)
    avg_temp = sum(temps) / len(temps) if temps else 25
    
    # Estimasi berdasarkan suhu (rule of thumb untuk Wonosobo)
    if avg_temp < 20:
        estimated_rainfall = 100  # Musim hujan/sejuk
        estimated_humidity = 80
    elif avg_temp > 28:
        estimated_rainfall = 40   # Musim kemarau panas
        estimated_humidity = 60
    else:
        estimated_rainfall = 70   # Kondisi sedang
        estimated_humidity = 70
    
    return {
        "avg_temp": avg_temp,
        "total_rainfall": estimated_rainfall,
        "avg_humidity": estimated_humidity,
        "prediction_days": len(predictions)
    }

def calculate_crop_suitability(crop_data: Dict, weather: Dict) -> float:
    """Hitung skor kesesuaian tanaman dengan kondisi cuaca (0-100)"""
    score = 0
    
    # Score berdasarkan suhu (40% bobot)
    temp_score = 0
    avg_temp = weather["avg_temp"]
    temp_optimal = crop_data["temp_optimal"]
    temp_tolerance = crop_data["temp_tolerance"]
    
    if temp_optimal[0] <= avg_temp <= temp_optimal[1]:
        temp_score = 100  # Perfect
    elif temp_tolerance[0] <= avg_temp <= temp_tolerance[1]:
        # Dalam toleransi tapi tidak optimal
        if avg_temp < temp_optimal[0]:
            temp_score = 70 - (temp_optimal[0] - avg_temp) * 5
        else:
            temp_score = 70 - (avg_temp - temp_optimal[1]) * 5
        temp_score = max(50, temp_score)
    else:
        temp_score = 20  # Di luar toleransi
    
    score += temp_score * 0.4
    
    # Score berdasarkan curah hujan (30% bobot)
    rain_score = 0
    rainfall = weather["total_rainfall"]
    rain_optimal = crop_data["rainfall_optimal"]
    rain_tolerance = crop_data["rainfall_tolerance"]
    
    if rain_optimal[0] <= rainfall <= rain_optimal[1]:
        rain_score = 100
    elif rain_tolerance[0] <= rainfall <= rain_tolerance[1]:
        if rainfall < rain_optimal[0]:
            rain_score = 70 - (rain_optimal[0] - rainfall) * 0.5
        else:
            rain_score = 70 - (rainfall - rain_optimal[1]) * 0.5
        rain_score = max(50, rain_score)
    else:
        rain_score = 25
    
    score += rain_score * 0.3
    
    # Score berdasarkan kelembapan (20% bobot)
    humidity_score = 0
    humidity = weather["avg_humidity"]
    humidity_optimal = crop_data["humidity_optimal"]
    
    if humidity_optimal[0] <= humidity <= humidity_optimal[1]:
        humidity_score = 100
    else:
        diff = min(abs(humidity - humidity_optimal[0]), abs(humidity - humidity_optimal[1]))
        humidity_score = max(40, 100 - diff * 2)
    
    score += humidity_score * 0.2
    
    # Bonus untuk nilai ekonomi (10% bobot)
    economic_bonus = {
        "sangat_tinggi": 100,
        "tinggi": 80,
        "sedang": 60,
        "rendah": 40
    }
    score += economic_bonus.get(crop_data["economic_value"], 60) * 0.1
    
    return min(100, max(0, score))

def get_suitability_level(score: float) -> str:
    """Konversi score ke level kesesuaian"""
    if score >= 80:
        return "Sangat Cocok"
    elif score >= 60:
        return "Cocok" 
    elif score >= 40:
        return "Cukup Cocok"
    else:
        return "Kurang Cocok"

def generate_planting_tips(weather: Dict) -> List[str]:
    """Generate tips penanaman berdasarkan kondisi cuaca"""
    tips = []
    avg_temp = weather["avg_temp"]
    rainfall = weather["total_rainfall"]
    humidity = weather["avg_humidity"]
    
    # Tips berdasarkan suhu
    if avg_temp < 20:
        tips.append("🌡️ Suhu sejuk - cocok untuk sayuran dataran tinggi seperti kentang, wortel, kol")
        tips.append("❄️ Siapkan mulsa untuk melindungi tanaman dari suhu dingin malam")
    elif avg_temp > 28:
        tips.append("☀️ Suhu panas - pilih tanaman tahan panas seperti jagung, kacang tanah")
        tips.append("💧 Siapkan sistem irigasi yang memadai")
    else:
        tips.append("🌤️ Suhu optimal - cocok untuk berbagai jenis tanaman pangan")
    
    # Tips berdasarkan curah hujan
    if rainfall < 60:
        tips.append("☂️ Curah hujan rendah - pilih tanaman tahan kekeringan")
        tips.append("🚰 Persiapkan sumber air irigasi alternatif")
    elif rainfall > 150:
        tips.append("🌧️ Curah hujan tinggi - pastikan drainase lahan baik")
        tips.append("🦠 Waspada penyakit jamur, aplikasi fungisida preventif")
    else:
        tips.append("☔ Curah hujan cukup - kondisi baik untuk sebagian besar tanaman")
    
    # Tips berdasarkan kelembapan
    if humidity > 80:
        tips.append("💨 Kelembapan tinggi - jaga sirkulasi udara, pangkas tanaman secara rutin")
    elif humidity < 60:
        tips.append("💦 Kelembapan rendah - tingkatkan frekuensi penyiraman")
    
    return tips

def determine_season_from_weather(weather: Dict) -> Dict[str, str]:
    """Tentukan musim berdasarkan kondisi cuaca"""
    avg_temp = weather["avg_temp"]
    rainfall = weather["total_rainfall"]
    
    if rainfall > 120 and avg_temp < 25:
        season = "musim_hujan"
        description = "Musim Hujan - cocok untuk padi, sayuran berdaun"
    elif rainfall < 60 and avg_temp > 26:
        season = "musim_kemarau"
        description = "Musim Kemarau - cocok untuk jagung, kacang-kacangan, cabai"
    else:
        season = "peralihan"
        description = "Musim Peralihan - cocok untuk berbagai tanaman"
    
    return {"season": season, "description": description}