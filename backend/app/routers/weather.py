from fastapi import APIRouter, HTTPException, Query
import httpx
import asyncio
from typing import Optional, Dict, Any
import logging
from datetime import datetime, timedelta

router = APIRouter()
logger = logging.getLogger(__name__)

class BMKGService:
    BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca"
    TIMEOUT = 30.0
    
    @staticmethod
    async def fetch_weather_data(adm4_code: str) -> Optional[Dict[str, Any]]:
        """Mengambil data cuaca dari API BMKG"""
        try:
            async with httpx.AsyncClient(timeout=BMKGService.TIMEOUT) as client:
                response = await client.get(
                    BMKGService.BASE_URL,
                    params={"adm4": adm4_code}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data
                else:
                    logger.error(f"BMKG API error: {response.status_code} - {response.text}")
                    return None
                    
        except httpx.TimeoutException:
            logger.error("BMKG API timeout")
            return None
        except Exception as e:
            logger.error(f"Error fetching BMKG data: {str(e)}")
            return None
    
    @staticmethod
    def process_weather_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Memproses data cuaca dari BMKG menjadi format yang konsisten"""
        try:
            location_info = raw_data.get('lokasi', {})
            forecast_data = raw_data.get('data', [])
            
            processed_data = {
                "location": {
                    "province": location_info.get('provinsi'),
                    "regency": location_info.get('kabupaten'),
                    "district": location_info.get('kecamatan'),
                    "village": location_info.get('desa'),
                    "coordinates": {
                        "lat": location_info.get('lat'),
                        "lon": location_info.get('lon')
                    }
                },
                "forecast": [],
                "updated_at": datetime.now().isoformat()
            }
            
            # Proses data prakiraan per hari
            for day_data in forecast_data:
                day_forecasts = day_data.get('cuaca', [])
                daily_forecast = []
                
                for forecast in day_forecasts:
                    daily_forecast.append({
                        "datetime": forecast.get('local_datetime'),
                        "weather_code": forecast.get('weather'),
                        "weather_desc": forecast.get('weather_desc'),
                        "temperature": forecast.get('t'),
                        "humidity": forecast.get('hu'),
                        "wind_speed": forecast.get('ws'),
                        "wind_direction": forecast.get('wd'),
                        "visibility": forecast.get('vs')
                    })
                
                if daily_forecast:
                    processed_data["forecast"].append(daily_forecast)
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error processing weather data: {str(e)}")
            return None

@router.get("/forecast")
async def get_weather_forecast(
    adm4_code: str = Query(..., description="Kode ADM4 wilayah (contoh: 33.07.01.2001)"),
    days: int = Query(3, description="Jumlah hari prakiraan (1-7)", ge=1, le=7)
):
    """Mendapatkan prakiraan cuaca dari BMKG"""
    try:
        # Validasi kode ADM4
        if not adm4_code or len(adm4_code.split('.')) != 4:
            raise HTTPException(status_code=400, detail="Format kode ADM4 tidak valid")
        
        # Ambil data dari BMKG
        raw_data = await BMKGService.fetch_weather_data(adm4_code)
        
        if not raw_data:
            raise HTTPException(status_code=503, detail="Gagal mengambil data dari BMKG API")
        
        # Proses data
        processed_data = BMKGService.process_weather_data(raw_data)
        
        if not processed_data:
            raise HTTPException(status_code=500, detail="Gagal memproses data cuaca")
        
        # Batasi jumlah hari sesuai parameter
        if len(processed_data["forecast"]) > days:
            processed_data["forecast"] = processed_data["forecast"][:days]
        
        return {
            "success": True,
            "data": processed_data,
            "source": "BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in weather forecast: {str(e)}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan internal")

@router.get("/current")
async def get_current_weather(
    adm4_code: str = Query(..., description="Kode ADM4 wilayah")
):
    """Mendapatkan cuaca saat ini"""
    try:
        # Ambil data prakiraan dan ambil yang terdekat dengan waktu saat ini
        raw_data = await BMKGService.fetch_weather_data(adm4_code)
        
        if not raw_data:
            raise HTTPException(status_code=503, detail="Gagal mengambil data dari BMKG API")
        
        processed_data = BMKGService.process_weather_data(raw_data)
        
        if not processed_data or not processed_data.get("forecast"):
            raise HTTPException(status_code=500, detail="Tidak ada data cuaca tersedia")
        
        # Ambil prakiraan pertama (paling dekat dengan waktu saat ini)
        current_forecast = processed_data["forecast"][0][0] if processed_data["forecast"] else None
        
        if not current_forecast:
            raise HTTPException(status_code=404, detail="Data cuaca saat ini tidak ditemukan")
        
        return {
            "success": True,
            "data": {
                "location": processed_data["location"],
                "current": current_forecast,
                "updated_at": processed_data["updated_at"]
            },
            "source": "BMKG"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current weather: {str(e)}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan internal")

@router.get("/locations")
async def get_available_locations():
    """Mendapatkan daftar lokasi yang tersedia"""
    # Daftar kode ADM4 untuk Kabupaten Wonosobo
    locations = {
        "33.07.01": "Kecamatan Wadaslintang",
        "33.07.02": "Kecamatan Kepil", 
        "33.07.03": "Kecamatan Sapuran",
        "33.07.04": "Kecamatan Kalibawang",
        "33.07.05": "Kecamatan Leksono",
        "33.07.06": "Kecamatan Sukoharjo",
        "33.07.07": "Kecamatan Kalikajar",
        "33.07.08": "Kecamatan Kertek",
        "33.07.09": "Kecamatan Wonosobo",
        "33.07.10": "Kecamatan Watumalang",
        "33.07.11": "Kecamatan Mojotengah",
        "33.07.12": "Kecamatan Garung",
        "33.07.13": "Kecamatan Kejajar",
        "33.07.14": "Kecamatan Selomerto",
        "33.07.15": "Kecamatan Kaliwiro"
    }
    
    return {
        "success": True,
        "data": locations,
        "total": len(locations)
    }
