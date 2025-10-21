import requests
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.db import SessionLocal
from app.models.market_model import MarketPrice

# URL API dari Kominfo Wonosobo
BASE_URL = "https://disdagkopukm.wonosobokab.go.id/api/produk-komoditas"

def fetch_and_save_market_data():
    """
    Mengambil data harga komoditas dari API Kominfo dan menyimpannya ke database.
    """
    try:
        response = requests.get(BASE_URL, timeout=20)
        response.raise_for_status()

        data = response.json()
        if not data:
            print("⚠️ Tidak ada data dari API Kominfo.")
            return {"message": "Tidak ada data yang diterima."}

        db: Session = SessionLocal()
        count = 0

        for item in data:
            # Pastikan field yang diambil sesuai struktur JSON API
            commodity_name = item.get("komoditas") or item.get("nama_komoditas") or "Tidak diketahui"
            market_location = item.get("pasar") or item.get("lokasi_pasar") or "Tidak diketahui"
            unit = item.get("satuan") or "-"
            harga_value = item.get("harga") or item.get("harga_komoditas") or 0

            try:
                price = float(harga_value)
            except (ValueError, TypeError):
                price = 0.0

            date_str = item.get("tanggal")
            try:
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else date.today()
            except Exception:
                parsed_date = date.today()

            # Cek duplikat supaya tidak double insert
            existing = db.query(MarketPrice).filter(
                MarketPrice.commodity_name == commodity_name,
                MarketPrice.market_location == market_location,
                MarketPrice.date == parsed_date
            ).first()

            if existing:
                continue  # skip jika data sudah ada

            new_price = MarketPrice(
                user_id=1,  # user dummy sementara
                commodity_name=commodity_name,
                market_location=market_location,
                unit=unit,
                price=price,
                date=parsed_date,
                created_at=datetime.now()
            )

            db.add(new_price)
            count += 1

        db.commit()
        db.close()

        print(f"✅ {count} data baru berhasil disimpan dari API Kominfo.")
        return {"message": f"{count} data berhasil disimpan ke database."}

    except requests.exceptions.RequestException as e:
        print(f"❌ Gagal menghubungi API Kominfo: {e}")
        return {"error": f"Gagal menghubungi API: {e}"}

    except Exception as e:
        print(f"❌ Gagal sinkronisasi data: {e}")
        return {"error": str(e)}
