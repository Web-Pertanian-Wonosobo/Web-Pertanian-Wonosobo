import requests
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Dict, Optional
from app.db import SessionLocal
from app.models.market_model import MarketPrice

# URL API dari Disdagkopukm Wonosobo
BASE_URL = "https://disdagkopukm.wonosobokab.go.id/api"

def fetch_realtime_komoditas() -> List[Dict]:
    """
    Mengambil data komoditas real-time dari API.
    """
    try:
        response = requests.get(f"{BASE_URL}/komoditas", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Error fetching komoditas: {e}")
        return []

def fetch_realtime_produk_komoditas() -> List[Dict]:
    """
    Mengambil data produk komoditas real-time dari API.
    """
    try:
        response = requests.get(f"{BASE_URL}/produk-komoditas", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Error fetching produk-komoditas: {e}")
        return []

def fetch_realtime_produk() -> List[Dict]:
    """
    Mengambil data produk real-time dari API.
    """
    try:
        response = requests.get(f"{BASE_URL}/produk", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Error fetching produk: {e}")
        return []

def get_realtime_market_prices() -> Dict:
    """
    Mengambil data harga pasar real-time dari semua endpoint.
    Menggabungkan data dari komoditas, produk, dan produk-komoditas.
    """
    try:
        all_prices = []
        
        # Fetch dari produk-komoditas (endpoint utama)
        produk_komoditas = fetch_realtime_produk_komoditas()
        for item in produk_komoditas:
            price_data = {
                "commodity_name": item.get("nama") or item.get("komoditas") or item.get("nama_komoditas") or "Tidak diketahui",
                "category": item.get("kategori") or item.get("nama_kategori") or "-",
                "unit": item.get("satuan") or "kg",
                "price": parse_price(item.get("harga") or item.get("harga_komoditas") or 0),
                "market_location": item.get("pasar") or item.get("lokasi_pasar") or "Wonosobo",
                "date": parse_date(item.get("tanggal") or item.get("updated_at")),
                "source": "produk-komoditas"
            }
            all_prices.append(price_data)
        
        # Fetch dari komoditas
        komoditas = fetch_realtime_komoditas()
        for item in komoditas:
            price_data = {
                "commodity_name": item.get("nama") or item.get("nama_komoditas") or "Tidak diketahui",
                "category": item.get("kategori") or item.get("nama_kategori") or "-",
                "unit": item.get("satuan") or "kg",
                "price": parse_price(item.get("harga") or item.get("harga_eceran") or 0),
                "market_location": item.get("lokasi") or item.get("pasar") or "Wonosobo",
                "date": parse_date(item.get("tanggal") or item.get("updated_at")),
                "source": "komoditas"
            }
            all_prices.append(price_data)
        
        # Fetch dari produk
        produk = fetch_realtime_produk()
        for item in produk:
            price_data = {
                "commodity_name": item.get("nama") or item.get("nama_produk") or "Tidak diketahui",
                "category": item.get("kategori") or "-",
                "unit": item.get("satuan") or "kg",
                "price": parse_price(item.get("harga") or item.get("harga_jual") or 0),
                "market_location": item.get("lokasi") or "Wonosobo",
                "date": parse_date(item.get("tanggal") or item.get("updated_at")),
                "source": "produk"
            }
            all_prices.append(price_data)
        
        return {
            "success": True,
            "total": len(all_prices),
            "data": all_prices,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        print(f"❌ Error getting realtime prices: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": []
        }

def parse_price(value) -> float:
    """
    Parse harga dari berbagai format ke float.
    """
    try:
        # Hapus karakter non-numerik kecuali titik dan koma
        if isinstance(value, str):
            value = value.replace("Rp", "").replace(".", "").replace(",", ".").strip()
        return float(value)
    except (ValueError, TypeError):
        return 0.0

def parse_date(value) -> date:
    """
    Parse tanggal dari berbagai format.
    """
    if not value:
        return date.today()
    
    try:
        # Coba berbagai format tanggal
        if isinstance(value, str):
            for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%Y-%m-%d %H:%M:%S", "%d/%m/%Y"]:
                try:
                    return datetime.strptime(value, fmt).date()
                except ValueError:
                    continue
        return date.today()
    except Exception:
        return date.today()

def fetch_and_save_market_data():
    """
    Mengambil data harga komoditas dari API dan menyimpannya ke database.
    """
    try:
        realtime_data = get_realtime_market_prices()
        
        if not realtime_data.get("success") or not realtime_data.get("data"):
            print("⚠️ Tidak ada data dari API Disdagkopukm.")
            return {"message": "Tidak ada data yang diterima."}

        db: Session = SessionLocal()
        count = 0

        for price_data in realtime_data["data"]:
            # Cek duplikat supaya tidak double insert
            existing = db.query(MarketPrice).filter(
                MarketPrice.commodity_name == price_data["commodity_name"],
                MarketPrice.market_location == price_data["market_location"],
                MarketPrice.date == price_data["date"]
            ).first()

            if existing:
                # Update harga jika sudah ada
                existing.price = price_data["price"]
                existing.unit = price_data["unit"]
                continue

            new_price = MarketPrice(
                user_id=1,  # user dummy sementara
                commodity_name=price_data["commodity_name"],
                market_location=price_data["market_location"],
                unit=price_data["unit"],
                price=price_data["price"],
                date=price_data["date"],
                created_at=datetime.now()
            )

            db.add(new_price)
            count += 1

        db.commit()
        db.close()

        print(f"✅ {count} data baru berhasil disimpan dari API Disdagkopukm.")
        return {
            "message": f"{count} data berhasil disimpan ke database.",
            "total_fetched": realtime_data["total"]
        }

    except requests.exceptions.RequestException as e:
        print(f"❌ Gagal menghubungi API Disdagkopukm: {e}")
        return {"error": f"Gagal menghubungi API: {e}"}

    except Exception as e:
        print(f"❌ Gagal sinkronisasi data: {e}")
        return {"error": str(e)}
