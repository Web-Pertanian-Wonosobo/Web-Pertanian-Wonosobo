"""
Router untuk data wilayah (proxy ke API Disdukcapil Wonosobo)
"""
from fastapi import APIRouter, HTTPException
import httpx
from typing import List, Dict, Any

router = APIRouter(prefix="/wilayah", tags=["wilayah"])

DISDUKCAPIL_API = "https://disdukcapil.wonosobokab.go.id/api/wilayah"

@router.get("/list")
async def get_wilayah_list():
    """
    Proxy endpoint untuk mengambil data wilayah dari API Disdukcapil Wonosobo.
    Menghindari masalah CORS dengan mengakses API dari backend.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(DISDUKCAPIL_API)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") == "success" and "data" in data:
                return {
                    "success": True,
                    "message": f"Berhasil mengambil {len(data['data'])} wilayah",
                    "data": data["data"]
                }
            else:
                raise HTTPException(status_code=500, detail="Format response API tidak sesuai")
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout saat mengakses API Disdukcapil")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Error mengakses API Disdukcapil: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/kecamatan/{nama}")
async def get_wilayah_by_name(nama: str):
    """
    Ambil data wilayah berdasarkan nama kecamatan
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(DISDUKCAPIL_API)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") == "success" and "data" in data:
                # Cari wilayah berdasarkan nama (case-insensitive)
                wilayah = next(
                    (w for w in data["data"] if w["nama"].lower() == nama.lower()),
                    None
                )
                
                if wilayah:
                    return {
                        "success": True,
                        "data": wilayah
                    }
                else:
                    raise HTTPException(status_code=404, detail=f"Kecamatan '{nama}' tidak ditemukan")
            else:
                raise HTTPException(status_code=500, detail="Format response API tidak sesuai")
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/count")
async def get_wilayah_count():
    """
    Hitung total jumlah kecamatan
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(DISDUKCAPIL_API)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") == "success" and "data" in data:
                return {
                    "success": True,
                    "count": len(data["data"]),
                    "message": f"Total {len(data['data'])} kecamatan di Wonosobo"
                }
            else:
                raise HTTPException(status_code=500, detail="Format response API tidak sesuai")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
