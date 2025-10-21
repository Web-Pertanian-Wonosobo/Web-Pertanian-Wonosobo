from fastapi import APIRouter, HTTPException, Query
import httpx
import asyncio
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime, timedelta
import json

router = APIRouter()
logger = logging.getLogger(__name__)

class BapanasService:
    """Service untuk mengambil data harga dari Badan Pangan Nasional (Bapanas)"""
    BASE_URL = "https://disdagkopukm.wonosobokab.go.id/api/"
    TIMEOUT = 30.0
    
    # Mapping komoditas dengan ID Bapanas
    COMMODITY_MAPPING = {
        "beras": {"id": "1", "name": "Beras Premium"},
        "cabai": {"id": "13", "name": "Cabai Merah Keriting"},
        "bawang_merah": {"id": "12", "name": "Bawang Merah"},
        "bawang_putih": {"id": "14", "name": "Bawang Putih"},
        "gula": {"id": "2", "name": "Gula Pasir Premium"},
        "minyak_goreng": {"id": "3", "name": "Minyak Goreng Curah"},
        "daging_sapi": {"id": "4", "name": "Daging Sapi Murni"},
        "daging_ayam": {"id": "5", "name": "Daging Ayam Ras"},
        "telur": {"id": "6", "name": "Telur Ayam Ras"},
        "jagung": {"id": "18", "name": "Jagung Pipilan Kering"}
    }
    
    @staticmethod
    async def fetch_price_data(commodity_id: str = None) -> Optional[Dict[str, Any]]:
        """Mengambil data harga dari API Bapanas"""
        try:
            async with httpx.AsyncClient(timeout=BapanasService.TIMEOUT) as client:
                # API endpoint untuk harga komoditas
                endpoint = f"{BapanasService.BASE_URL}/harga-komoditas"
                
                params = {}
                if commodity_id:
                    params["komoditas_id"] = commodity_id
                    
                response = await client.get(endpoint, params=params)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Bapanas API error: {response.status_code} - {response.text}")
                    # Fallback ke data simulasi jika API tidak tersedia
                    return BapanasService.get_fallback_data()
                    
        except Exception as e:
            logger.error(f"Error fetching Bapanas data: {str(e)}")
            # Fallback ke data simulasi
            return BapanasService.get_fallback_data()
    
    @staticmethod
    def get_fallback_data() -> Dict[str, Any]:
        """Data fallback jika API eksternal tidak tersedia"""
        return {
            "data": [
                {
                    "komoditas": "Beras Premium",
                    "harga": 15800,
                    "satuan": "kg",
                    "tanggal": datetime.now().strftime("%Y-%m-%d"),
                    "provinsi": "Jawa Tengah",
                    "kota": "Wonosobo",
                    "pasar": "Pasar Induk Regional"
                },
                {
                    "komoditas": "Cabai Merah Keriting",
                    "harga": 48000,
                    "satuan": "kg",
                    "tanggal": datetime.now().strftime("%Y-%m-%d"),
                    "provinsi": "Jawa Tengah",
                    "kota": "Wonosobo",
                    "pasar": "Pasar Wage"
                },
                {
                    "komoditas": "Bawang Merah",
                    "harga": 32000,
                    "satuan": "kg",
                    "tanggal": datetime.now().strftime("%Y-%m-%d"),
                    "provinsi": "Jawa Tengah",
                    "kota": "Wonosobo",
                    "pasar": "Pasar Kejajar"
                },
                {
                    "komoditas": "Jagung Pipilan Kering",
                    "harga": 6500,
                    "satuan": "kg",
                    "tanggal": datetime.now().strftime("%Y-%m-%d"),
                    "provinsi": "Jawa Tengah",
                    "kota": "Wonosobo",
                    "pasar": "Pasar Induk Regional"
                },
                {
                    "komoditas": "Gula Pasir Premium",
                    "harga": 17500,
                    "satuan": "kg",
                    "tanggal": datetime.now().strftime("%Y-%m-%d"),
                    "provinsi": "Jawa Tengah",
                    "kota": "Wonosobo",
                    "pasar": "Pasar Wage"
                }
            ],
            "source": "Simulasi Data (API eksternal tidak tersedia)"
        }

class LocalMarketService:
    """Service untuk data pasar lokal Wonosobo"""
    
    @staticmethod
    async def get_local_prices() -> Dict[str, Any]:
        """Simulasi data pasar lokal Wonosobo"""
        local_markets = [
            {
                "nama_pasar": "Pasar Wage Wonosobo",
                "alamat": "Jl. Pemuda, Wonosobo",
                "komoditas": [
                    {"nama": "Beras IR64", "harga": 12000, "satuan": "kg", "stok": "Tersedia"},
                    {"nama": "Cabai Rawit", "harga": 65000, "satuan": "kg", "stok": "Terbatas"},
                    {"nama": "Bawang Merah Lokal", "harga": 28000, "satuan": "kg", "stok": "Tersedia"},
                    {"nama": "Tomat", "harga": 8000, "satuan": "kg", "stok": "Tersedia"}
                ],
                "jam_operasional": "05:00 - 17:00",
                "hari_pasar": "Senin, Kamis"
            },
            {
                "nama_pasar": "Pasar Kejajar",
                "alamat": "Kejajar, Wonosobo",
                "komoditas": [
                    {"nama": "Kentang Dieng", "harga": 15000, "satuan": "kg", "stok": "Melimpah"},
                    {"nama": "Wortel", "harga": 12000, "satuan": "kg", "stok": "Tersedia"},
                    {"nama": "Kubis", "harga": 5000, "satuan": "kg", "stok": "Tersedia"},
                    {"nama": "Brokoli", "harga": 18000, "satuan": "kg", "stok": "Terbatas"}
                ],
                "jam_operasional": "04:00 - 16:00",
                "hari_pasar": "Selasa, Jumat"
            },
            {
                "nama_pasar": "Pasar Sapuran",
                "alamat": "Sapuran, Wonosobo",
                "komoditas": [
                    {"nama": "Jagung Manis", "harga": 4000, "satuan": "kg", "stok": "Melimpah"},
                    {"nama": "Kacang Tanah", "harga": 22000, "satuan": "kg", "stok": "Tersedia"},
                    {"nama": "Ubi Jalar", "harga": 6000, "satuan": "kg", "stok": "Tersedia"},
                    {"nama": "Singkong", "harga": 3500, "satuan": "kg", "stok": "Melimpah"}
                ],
                "jam_operasional": "05:30 - 17:30",
                "hari_pasar": "Rabu, Sabtu"
            }
        ]
        
        return {
            "data": local_markets,
            "total_pasar": len(local_markets),
            "updated_at": datetime.now().isoformat(),
            "source": "Data Pasar Lokal Wonosobo"
        }

@router.get("/prices")
async def get_commodity_prices(
    commodity: Optional[str] = Query(None, description="Jenis komoditas (beras, cabai, bawang_merah, dll)"),
    source: str = Query("all", description="Sumber data: bapanas, local, atau all")
):
    """Mendapatkan harga komoditas dari berbagai sumber"""
    try:
        result = {
            "success": True,
            "data": {
                "bapanas": None,
                "local_markets": None
            },
            "updated_at": datetime.now().isoformat()
        }
        
        # Ambil data dari Bapanas
        if source in ["bapanas", "all"]:
            commodity_id = None
            if commodity and commodity in BapanasService.COMMODITY_MAPPING:
                commodity_id = BapanasService.COMMODITY_MAPPING[commodity]["id"]
            
            bapanas_data = await BapanasService.fetch_price_data(commodity_id)
            result["data"]["bapanas"] = bapanas_data
        
        # Ambil data pasar lokal
        if source in ["local", "all"]:
            local_data = await LocalMarketService.get_local_prices()
            result["data"]["local_markets"] = local_data
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting commodity prices: {str(e)}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan saat mengambil data harga")

@router.get("/price-history")
async def get_price_history(
    commodity: str = Query(..., description="Jenis komoditas"),
    days: int = Query(30, description="Jumlah hari riwayat", ge=7, le=90)
):
    """Mendapatkan riwayat harga komoditas (simulasi)"""
    try:
        # Simulasi data riwayat harga
        import random
        
        base_prices = {
            "beras": 14000,
            "cabai": 45000,
            "bawang_merah": 30000,
            "jagung": 6000,
            "gula": 17000
        }
        
        if commodity not in base_prices:
            raise HTTPException(status_code=400, detail="Komoditas tidak ditemukan")
        
        base_price = base_prices[commodity]
        history = []
        
        for i in range(days, 0, -1):
            date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            # Simulasi fluktuasi harga ±20%
            variation = random.uniform(-0.2, 0.2)
            price = int(base_price * (1 + variation))
            
            history.append({
                "tanggal": date,
                "harga": price,
                "satuan": "kg"
            })
        
        # Tambah prediksi 7 hari ke depan
        predictions = []
        last_price = history[-1]["harga"]
        
        for i in range(1, 8):
            date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
            # Simulasi tren prediksi
            trend = random.uniform(-0.05, 0.05)
            predicted_price = int(last_price * (1 + trend))
            
            predictions.append({
                "tanggal": date,
                "harga_prediksi": predicted_price,
                "satuan": "kg",
                "confidence": random.uniform(0.7, 0.9)
            })
            
            last_price = predicted_price
        
        return {
            "success": True,
            "data": {
                "commodity": commodity,
                "history": history,
                "predictions": predictions
            },
            "source": "Simulasi Data Historis dan Prediksi AI"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting price history: {str(e)}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan saat mengambil riwayat harga")

@router.get("/markets")
async def get_local_markets():
    """Mendapatkan daftar pasar lokal"""
    try:
        local_data = await LocalMarketService.get_local_prices()
        return local_data
        
    except Exception as e:
        logger.error(f"Error getting local markets: {str(e)}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan saat mengambil data pasar")

@router.get("/commodities")
async def get_available_commodities():
    """Mendapatkan daftar komoditas yang tersedia"""
    return {
        "success": True,
        "data": BapanasService.COMMODITY_MAPPING,
        "total": len(BapanasService.COMMODITY_MAPPING)
    }

# Endpoint harga real-time dari API Bapanas

# Endpoint harga real-time dari API Disdagkopukm
@router.get("/realtime-price")
async def get_realtime_price(komoditas: str = Query(None), id: int = Query(None)):
    import httpx
    base_url = "https://disdagkopukm.wonosobokab.go.id/api"
    async with httpx.AsyncClient() as client:
        if id:
            url = f"{base_url}/komoditas/{id}"
            response = await client.get(url)
            if response.status_code != 200:
                return {"success": False, "error": "Gagal mengambil data komoditas berdasarkan id"}
            return {"success": True, "data": response.json()}
        else:
            url = f"{base_url}/komoditas"
            response = await client.get(url)
            if response.status_code != 200:
                return {"success": False, "error": "Gagal mengambil data daftar komoditas"}
            all_data = response.json()
            # Filter berdasarkan nama jika parameter komoditas diberikan
            if komoditas:
                filtered = [item for item in all_data if komoditas.lower() in item.get("nama", "").lower()]
                if not filtered:
                    return {"success": False, "error": "Komoditas tidak ditemukan"}
                return {"success": True, "data": filtered}
            return {"success": True, "data": all_data}

# Endpoint prediksi harga AI
@router.get("/predict-price")
def predict_price(komoditas: str = Query(...), tanggal: str = Query(...)):
    import pickle
    import pandas as pd
    import os
    # Path model
    model_path = os.path.join(os.path.dirname(__file__), f"../../model_{komoditas.replace(' ', '_')}.pkl")
    if not os.path.exists(model_path):
        return {"success": False, "error": "Model tidak ditemukan"}

    # Load model
    with open(model_path, "rb") as f:
        model = pickle.load(f)

    # Konversi tanggal ke ordinal
    tanggal_num = pd.to_datetime(tanggal).toordinal()
    prediksi = model.predict([[tanggal_num]])[0]

    return {
        "success": True,
        "komoditas": komoditas,
        "tanggal": tanggal,
        "harga_prediksi": int(prediksi)
    }
