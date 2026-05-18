from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Optional
import logging
from app.db import get_db
from app.services.market_sync import (
    fetch_and_save_market_data, 
    get_realtime_market_prices,
    fetch_realtime_komoditas,
    fetch_realtime_produk_komoditas,
    fetch_realtime_produk
)
from app.models.market_model import MarketPrice
from app.models.user_model import User
from app.models.log_model import LogActivity
from app.schemas.market_schema import MarketPriceCreate

router = APIRouter(prefix="/market", tags=["Market Data"])

@router.get("/realtime")
def get_realtime_prices():
    """
    Mengambil data harga pasar real-time langsung dari API Disdagkopukm.
    Data tidak disimpan ke database, langsung dari API.
    """
    try:
        result = get_realtime_market_prices()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data real-time: {e}")

@router.get("/realtime/komoditas")
def get_komoditas_realtime():
    """
    Mengambil data komoditas real-time dari API.
    """
    try:
        data = fetch_realtime_komoditas()
        return {
            "success": True,
            "total": len(data),
            "data": data,
            "source": "https://disdagkopukm.wonosobokab.go.id/api/komoditas"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data komoditas: {e}")

@router.get("/realtime/produk-komoditas")
def get_produk_komoditas_realtime():
    """
    Mengambil data produk komoditas real-time dari API.
    """
    try:
        data = fetch_realtime_produk_komoditas()
        return {
            "success": True,
            "total": len(data),
            "data": data,
            "source": "https://disdagkopukm.wonosobokab.go.id/api/produk-komoditas"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data produk-komoditas: {e}")

@router.get("/realtime/produk")
def get_produk_realtime():
    """
    Mengambil data produk real-time dari API.
    """
    try:
        data = fetch_realtime_produk()
        return {
            "success": True,
            "total": len(data),
            "data": data,
            "source": "https://disdagkopukm.wonosobokab.go.id/api/produk"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data produk: {e}")

@router.post("/sync")
def sync_market_data():
    """
    Mengambil data dari API Disdagkopukm dan menyimpannya ke database lokal.
    """
    result = fetch_and_save_market_data()
    return result

@router.get("/list")
def get_market_prices(
    db: Session = Depends(get_db),
    commodity: Optional[str] = Query(None, description="Filter berdasarkan nama komoditas"),
    location: Optional[str] = Query(None, description="Filter berdasarkan lokasi pasar"),
    start_date: Optional[date] = Query(None, description="Filter tanggal mulai"),
    end_date: Optional[date] = Query(None, description="Filter tanggal akhir"),
    limit: Optional[int] = Query(None, description="Jumlah data maksimal (kosongkan untuk ambil semua)")
):
    """
    Mengambil data harga dari database lokal dengan filter.
    Jika limit=None atau tidak diisi, akan mengambil semua data.
    """
    try:
        query = db.query(MarketPrice)
        
        if commodity:
            query = query.filter(MarketPrice.commodity_name.ilike(f"%{commodity}%"))
        
        if location:
            query = query.filter(MarketPrice.market_location.ilike(f"%{location}%"))
        
        if start_date:
            query = query.filter(MarketPrice.date >= start_date)
        
        if end_date:
            query = query.filter(MarketPrice.date <= end_date)
        
        query = query.order_by(MarketPrice.price_id.desc())
        
        # Jika limit tidak diisi, ambil semua data
        if limit is not None and limit > 0:
            prices = query.limit(limit).all()
        else:
            prices = query.all()
        
        return {
            "success": True,
            "total": len(prices),
            "data": [
                {
                    "price_id": p.price_id,
                    "commodity_name": p.commodity_name,
                    "market_location": p.market_location,
                    "unit": p.unit,
                    "price": p.price,
                    "date": p.date.isoformat(),
                    "planting_date": p.planting_date.isoformat() if p.planting_date else None,
                    "user_id": p.user_id,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in prices
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data: {e}")

@router.post("/test-schema")
def test_schema_validation(price_data: MarketPriceCreate):
    """
    Test endpoint untuk debugging schema validation
    """
    try:
        logging.info(f"📊 Test schema received: {price_data.dict()}")
        return {
            "status": "success",
            "message": "Schema validation passed",
            "data": price_data.dict()
        }
    except Exception as e:
        logging.error(f"❌ Schema validation error: {e}")
        raise HTTPException(status_code=422, detail=f"Schema validation failed: {e}")

@router.post("/add")
def add_market_price(price_data: MarketPriceCreate, db: Session = Depends(get_db)):
    """
    Menyimpan data harga pasar ke database (pakai JSON body).
    """
    try:
        # Log data yang diterima untuk debugging
        logging.info(f"📊 Received price data: {price_data.dict()}")
        
        # Validasi tambahan
        if not price_data.commodity_name.strip():
            raise HTTPException(status_code=422, detail="commodity_name tidak boleh kosong")
        if not price_data.market_location.strip():
            raise HTTPException(status_code=422, detail="market_location tidak boleh kosong")
        if price_data.price <= 0:
            raise HTTPException(status_code=422, detail="price harus lebih besar dari 0")
        
        # 1. CEK DUPLIKASI: Nama + Lokasi + Harga + Tanggal yang sama persis
        # Jika semua sama, maka ditolak karena dianggap data sampah/dobel klik
        # Tanggal di DB biasanya bertipe Date, pastikan perbandingannya tepat
        existing = db.query(MarketPrice).filter(
            MarketPrice.commodity_name == price_data.commodity_name.strip(),
            MarketPrice.market_location == price_data.market_location.strip(),
            MarketPrice.price == price_data.price,
            MarketPrice.date == (price_data.date if price_data.date else date.today())
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Data untuk {price_data.commodity_name} di {price_data.market_location} dengan harga Rp {price_data.price} pada tanggal {price_data.date or date.today()} sudah ada. Tidak perlu diinput ulang."
            )
        
        # Pastikan user_id valid untuk menghindari ForeignKeyViolation
        target_user_id = price_data.user_id
        
        # Cek apakah user_id ada di database
        user_exists = db.query(User).filter(User.user_id == target_user_id).first()
        
        if not user_exists:
            # Jika tidak ada, coba cari user pertama (biasanya admin)
            first_user = db.query(User).first()
            if first_user:
                target_user_id = first_user.user_id
                logging.info(f"⚠️ User ID {price_data.user_id} not found, fallback to User ID {target_user_id}")
            else:
                # Jika benar-benar tidak ada user, kita mungkin perlu membuat satu 
                # atau memberikan pesan error yang lebih jelas.
                # Untuk keamanan, kita gunakan ID 1 saja dan biarkan DB error jika FK constraint ketat,
                # tapi biasanya admin sudah ada.
                target_user_id = 1
        
        new_price = MarketPrice(
            user_id=target_user_id,
            commodity_name=price_data.commodity_name.strip(),
            market_location=price_data.market_location.strip(),
            unit=price_data.unit.strip(),
            price=float(price_data.price),
            date=datetime.strptime(price_data.date, '%Y-%m-%d').date() if price_data.date else datetime.now().date(),
            planting_date=datetime.strptime(price_data.planting_date, '%Y-%m-%d').date() if price_data.planting_date else None,
            created_at=datetime.now()
        )
        
        db.add(new_price)
        db.commit()
        db.refresh(new_price)
        
        logging.info(f"✅ Price data saved with ID: {new_price.price_id}")
        return {
            "status": "success", 
            "message": "Data harga berhasil disimpan", 
            "data": new_price.price_id
        }
        
    except RequestValidationError as e:
        logging.error(f"❌ Validation error: {e}")
        raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")
    except HTTPException:
        raise  # Re-raise HTTPException as is
    except Exception as e:
        db.rollback()
        logging.error(f"❌ Error saving price data: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan data: {e}")

@router.put("/update/{price_id}")
def update_market_price(
    price_id: int,
    price_data: MarketPriceCreate,
    db: Session = Depends(get_db)
):
    """
    Update data harga pasar berdasarkan ID.
    """
    try:
        existing = db.query(MarketPrice).filter(MarketPrice.price_id == price_id).first()
        if not existing:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")
        
        existing.commodity_name = price_data.commodity_name
        existing.market_location = price_data.market_location
        existing.unit = price_data.unit
        existing.price = price_data.price
        existing.date = price_data.date or existing.date
        existing.planting_date = price_data.planting_date or existing.planting_date
        
        db.commit()
        db.refresh(existing)
        return {"message": "Data berhasil diupdate", "data": existing.price_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal update data: {e}")

@router.delete("/delete/{price_id}")
def delete_market_price(price_id: int, db: Session = Depends(get_db)):
    """
    Hapus data harga pasar berdasarkan ID.
    """
    try:
        existing = db.query(MarketPrice).filter(MarketPrice.price_id == price_id).first()
        if not existing:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")
        
        db.delete(existing)
        db.commit()
        return {"message": "Data berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal hapus data: {e}")

@router.get("/stats")
def get_market_stats(
    year: Optional[int] = Query(None, description="Filter statistik berdasarkan tahun"),
    db: Session = Depends(get_db)
):
    """
    Mengambil statistik untuk dashboard analytics dengan filter tahun.
    """
    try:
        from sqlalchemy import func
        from datetime import datetime
        
        target_year = year or datetime.now().year

        # 1. Tren Input Harga (Filter Tahun)
        price_trends = db.query(
            func.to_char(MarketPrice.date, 'Mon').label('month'),
            func.count(MarketPrice.price_id).label('count')
        ).filter(func.extract('year', MarketPrice.date) == target_year)\
         .group_by('month')\
         .all()

        # 2. Distribusi Komoditas (Top 6 - Keseluruhan atau bisa filter tahun)
        commodity_dist = db.query(
            MarketPrice.commodity_name,
            func.count(MarketPrice.price_id).label('value')
        ).filter(func.extract('year', MarketPrice.date) == target_year)\
         .group_by(MarketPrice.commodity_name)\
         .order_by(func.count(MarketPrice.price_id).desc())\
         .limit(6)\
         .all()

        # 3. Pertumbuhan Pengguna (Filter Tahun)
        user_growth = db.query(
            func.to_char(User.created_at, 'Mon').label('month'),
            func.count(User.user_id).label('users')
        ).filter(func.extract('year', User.created_at) == target_year)\
         .group_by('month')\
         .all()

        # 4. Total Metrics
        total_prices = db.query(func.count(MarketPrice.price_id)).filter(func.extract('year', MarketPrice.date) == target_year).scalar() or 0
        total_users = db.query(func.count(User.user_id)).scalar() or 0
        manual_entries = db.query(func.count(MarketPrice.price_id))\
            .filter(MarketPrice.user_id != None)\
            .filter(func.extract('year', MarketPrice.date) == target_year).scalar() or 0

        # Urutkan tren berdasarkan bulan (Jan, Feb, ...)
        month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        sorted_price_trends = sorted(
            [{"month": r.month, "count": r.count} for r in price_trends],
            key=lambda x: month_order.index(x["month"]) if x["month"] in month_order else 99
        )

        sorted_user_growth = sorted(
            [{"month": r.month, "users": r.users} for r in user_growth],
            key=lambda x: month_order.index(x["month"]) if x["month"] in month_order else 99
        )

        # 5. Aktivitas Hari Ini (Optimasi Query)
        today = datetime.now().date()
        
        # Helper function untuk hitung log harian
        def count_log(pattern: str):
            return db.query(func.count(LogActivity.log_id)).filter(
                LogActivity.activity.ilike(pattern),
                func.cast(LogActivity.timestamp, sqlalchemy.Date) == today
            ).scalar() or 0

        import sqlalchemy
        activities = {
            "dashboard_access": count_log("%Sesi Dashboard Utama%"),
            "gis_access": count_log("%Sesi GIS Lereng%"),
            "weather_check": count_log("%Cek Cuaca%"),
            "price_check": count_log("%Lihat Harga%"),
            "report_download": count_log("%Download CSV%")
        }

        return {
            "success": True,
            "metrics": {
                "total_data": total_prices,
                "total_users": total_users,
                "manual_verified": manual_entries,
                "accuracy": 89
            },
            "charts": {
                "price_trends": sorted_price_trends,
                "commodity_dist": [{"name": r.commodity_name, "value": r.value} for r in commodity_dist],
                "user_growth": sorted_user_growth
            },
            "activities": activities
        }
    except Exception as e:
        import traceback
        logging.error(f"[ERROR] Analytics failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Gagal memuat statistik")

@router.post("/log")
def log_user_activity(activity: str, user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Mencatat aktivitas pengguna ke database.
    """
    try:
        from app.models.log_model import LogActivity
        new_log = LogActivity(
            user_id=user_id,
            activity=activity,
            timestamp=datetime.now()
        )
        db.add(new_log)
        db.commit()
        return {"success": True}
    except Exception as e:
        logging.error(f"Failed to log activity: {e}")
        return {"success": False}
