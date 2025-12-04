from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.services.crop_recommendation import get_crop_recommendations
from app.services.ai_weather import predict_weather_by_coordinates, DISTRICTS
from app.db import get_db
import logging

router = APIRouter(prefix="/crops", tags=["Crop Recommendation"])

@router.get("/recommend/coordinates")
def recommend_crops_by_coordinates(
    lat: float = Query(..., description="Latitude koordinat lokasi"),
    lon: float = Query(..., description="Longitude koordinat lokasi"), 
    location_name: str = Query(None, description="Nama lokasi (opsional)"),
    days: int = Query(7, description="Jumlah hari prediksi cuaca untuk analisis (default: 7)"),
    db: Session = Depends(get_db)
):
    """
    Rekomendasi komoditas pangan berdasarkan prediksi cuaca AI/ML untuk koordinat spesifik.
    Menggunakan data real OpenWeather dan model Prophet ML.
    """
    try:
        # Validasi koordinat
        if not (-90 <= lat <= 90):
            raise HTTPException(status_code=400, detail="Latitude harus antara -90 dan 90")
        if not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Longitude harus antara -180 dan 180")
        
        logging.info(f"🌾 Generating crop recommendations for {location_name or 'Unknown'} ({lat}, {lon})")
        
        # Dapatkan prediksi cuaca menggunakan AI/ML
        weather_predictions = predict_weather_by_coordinates(db, lat, lon, location_name, days)
        
        # Konversi ke format yang diperlukan untuk analisis
        predictions_data = []
        for pred in weather_predictions:
            predictions_data.append({
                "date": pred.date.isoformat() if hasattr(pred.date, 'isoformat') else str(pred.date),
                "predicted_temp": float(pred.predicted_temp) if pred.predicted_temp is not None else 25.0,
                "lower_bound": float(pred.lower_bound) if pred.lower_bound is not None else 20.0,
                "upper_bound": float(pred.upper_bound) if pred.upper_bound is not None else 30.0,
                "source": pred.source or "Unknown"
            })
        
        # Generate rekomendasi tanaman
        recommendations = get_crop_recommendations(predictions_data, location_name or f"Lat{lat}_Lon{lon}")
        
        return {
            "status": "success",
            "coordinates": {"lat": lat, "lon": lon},
            "location_name": location_name or f"Lat{lat}_Lon{lon}",
            "weather_predictions_used": len(predictions_data),
            "prediction_source": predictions_data[0]["source"] if predictions_data else "Unknown",
            **recommendations
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in recommend_crops_by_coordinates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommend")
def recommend_crops_by_location(
    location: str = Query(..., description="Nama lokasi/kecamatan di Wonosobo"),
    days: int = Query(7, description="Jumlah hari prediksi cuaca (default: 7)"),
    db: Session = Depends(get_db)
):
    """
    Rekomendasi komoditas pangan berdasarkan nama lokasi.
    Akan mencari koordinat dari database DISTRICTS dan memanggil fungsi koordinat.
    """
    try:
        # Cari koordinat berdasarkan nama lokasi
        location_coords = None
        for district in DISTRICTS:
            if district["name"].lower() == location.lower():
                location_coords = district
                break
        
        if not location_coords:
            raise HTTPException(
                status_code=404, 
                detail=f"Lokasi '{location}' tidak ditemukan. Lokasi tersedia: {[d['name'] for d in DISTRICTS]}"
            )
        
        # Redirect ke endpoint koordinat
        return recommend_crops_by_coordinates(
            lat=location_coords["lat"],
            lon=location_coords["lon"], 
            location_name=location,
            days=days,
            db=db
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in recommend_crops_by_location: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/database")
def get_crops_database():
    """
    Mendapatkan database lengkap tanaman yang tersedia untuk rekomendasi.
    """
    try:
        from app.services.crop_recommendation import CROPS_DATABASE
        
        # Format data untuk response
        crops_info = []
        for crop_id, crop_data in CROPS_DATABASE.items():
            crops_info.append({
                "id": crop_id,
                "name": crop_data["name"],
                "category": crop_data["category"],
                "temp_optimal": f"{crop_data['temp_optimal'][0]}-{crop_data['temp_optimal'][1]}°C",
                "rainfall_optimal": f"{crop_data['rainfall_optimal'][0]}-{crop_data['rainfall_optimal'][1]} mm/bulan",
                "growth_period": f"{crop_data['growth_period']} hari",
                "economic_value": crop_data["economic_value"],
                "difficulty": crop_data["difficulty"],
                "description": crop_data["description"]
            })
        
        return {
            "status": "success",
            "total_crops": len(crops_info),
            "categories": list(set([c["category"] for c in crops_info])),
            "crops": crops_info
        }
    except Exception as e:
        logging.error(f"Error in get_crops_database: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/locations")
def get_available_locations():
    """
    Mendapatkan daftar lokasi yang tersedia untuk rekomendasi tanaman.
    """
    try:
        locations = []
        for district in DISTRICTS:
            locations.append({
                "name": district["name"],
                "coordinates": {"lat": district["lat"], "lon": district["lon"]},
                "region": "Kabupaten Wonosobo"
            })
        
        return {
            "status": "success",
            "total_locations": len(locations),
            "locations": locations
        }
    except Exception as e:
        logging.error(f"Error in get_available_locations: {e}")
        raise HTTPException(status_code=500, detail=str(e))