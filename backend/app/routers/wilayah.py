"""
Router untuk data wilayah (proxy ke API Disdukcapil Wonosobo)
"""
from fastapi import APIRouter, HTTPException
import httpx
from typing import List, Dict, Any

router = APIRouter(prefix="/wilayah", tags=["wilayah"])

DISDUKCAPIL_API = "https://disdukcapil.wonosobokab.go.id/api/wilayah"

# Data kecamatan Wonosobo sebagai cadangan (fallback) jika API eksternal mati
# Format kode disesuaikan menjadi 6 digit agar lolos filter di Dashboard.tsx
FALLBACK_WILAYAH = [
    {"id": 1, "nama": "Wadaslintang", "kode": "330701"},
    {"id": 2, "nama": "Kepil", "kode": "330702"},
    {"id": 3, "nama": "Sapuran", "kode": "330703"},
    {"id": 4, "nama": "Kalibawang", "kode": "330704"},
    {"id": 5, "nama": "Kaliwiro", "kode": "330705"},
    {"id": 6, "nama": "Leksono", "kode": "330706"},
    {"id": 7, "nama": "Sukoharjo", "kode": "330707"},
    {"id": 8, "nama": "Selomerto", "kode": "330708"},
    {"id": 9, "nama": "Kalikajar", "kode": "330709"},
    {"id": 10, "nama": "Kertek", "kode": "330710"},
    {"id": 11, "nama": "Wonosobo", "kode": "330711"},
    {"id": 12, "nama": "Watumalang", "kode": "330712"},
    {"id": 13, "nama": "Mojotengah", "kode": "330713"},
    {"id": 14, "nama": "Garung", "kode": "330714"},
    {"id": 15, "nama": "Kejajar", "kode": "330715"},
]

@router.get("/list")
async def get_wilayah_list():
    """
    Proxy endpoint untuk mengambil data wilayah.
    Jika API Disdukcapil Wonosobo mati atau datanya KOSONG, gunakan data lokal.
    """
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(DISDUKCAPIL_API)
            if response.status_code == 200:
                data = response.json()
                # Jika status success DAN datanya tidak kosong
                if data.get("status") == "success" and data.get("data") and len(data["data"]) > 0:
                    return {
                        "success": True,
                        "source": "api",
                        "data": data["data"]
                    }
    except Exception:
        pass
        
    return {
        "success": True,
        "source": "local_fallback",
        "message": "Menggunakan data kecamatan lokal (API eksternal kosong/error)",
        "data": FALLBACK_WILAYAH
    }

@router.get("/kecamatan/{nama}")
async def get_wilayah_by_name(nama: str):
    """
    Ambil data wilayah berdasarkan nama kecamatan.
    """
    data_wilayah = FALLBACK_WILAYAH
    source = "local_fallback"
    
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(DISDUKCAPIL_API)
            if response.status_code == 200:
                api_data = response.json()
                if api_data.get("status") == "success" and api_data.get("data") and len(api_data["data"]) > 0:
                    data_wilayah = api_data["data"]
                    source = "api"
    except Exception:
        pass
        
    wilayah = next(
        (w for w in data_wilayah if w["nama"].lower() == nama.lower()),
        None
    )
    
    if wilayah:
        return {"success": True, "source": source, "data": wilayah}
    else:
        raise HTTPException(status_code=404, detail=f"Kecamatan '{nama}' tidak ditemukan")

@router.get("/count")
async def get_wilayah_count():
    """
    Hitung total jumlah kecamatan.
    Jika API mati atau nol, gunakan angka 15 (fallback).
    """
    count = len(FALLBACK_WILAYAH)
    source = "local_fallback"
    
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(DISDUKCAPIL_API)
            if response.status_code == 200:
                api_data = response.json()
                if api_data.get("status") == "success" and api_data.get("data") and len(api_data["data"]) > 0:
                    count = len(api_data["data"])
                    source = "api"
    except Exception:
        pass
        
    return {
        "success": True,
        "source": source,
        "count": count
    }
