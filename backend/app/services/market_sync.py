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
        response = requests.get(BASE_URL, timeout=10)
        response.raise_for_status()  # kalau status bukan 200, lempar error

        data = response.json()

        if not data:
            print("⚠️ Tidak ada data dari API Kominfo.")
            return {"message": "Tidak ada data yang diterima."}

        db: Session = SessionLocal()
        count = 0

        for item in data:
            # pastikan data yang dibutuhkan tersedia
            commodity_name = item.get("komoditas", "Tidak diketahui")
            market_location = item.get("pasar", "Tidak diketahui")
            unit = item.get("satuan", "-")
            price = float(item.get("harga", 0))
            date_str = item.get("tanggal", None)

            # Konversi tanggal (jika ada)
            try:
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else date.today()
            except ValueError:
                parsed_date = date.today()

            new_price = MarketPrice(
                user_id=1,  # sementara pakai user dummy
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

        print(f"✅ {count} data berhasil disimpan dari API Kominfo.")
        return {"message": f"{count} data berhasil disimpan ke database."}

    except Exception as e:
        print(f"❌ Gagal sinkronisasi data: {e}")
        return {"error": str(e)}
