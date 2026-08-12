import logging
import re
from datetime import date, datetime
from html import unescape
from typing import Dict, List
from urllib.parse import parse_qs, urlparse

import requests
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.market_model import MarketPrice

logger = logging.getLogger(__name__)

# URL sumber data harga pasar Disdagkopukm Wonosobo
MARKET_SOURCE_URL = "https://disdagkopukm.wonosobokab.go.id/harga-pasar"


def _strip_html(value: str) -> str:
    cleaned = re.sub(r"<[^>]*>", "", value or "")
    return " ".join(unescape(cleaned).split())


def _fetch_harga_pasar_rows() -> Dict:
    """
    Mengambil dan parse tabel harga pasar dari halaman web resmi.
    """
    response = requests.get(MARKET_SOURCE_URL, timeout=15)
    response.raise_for_status()
    html = response.text

    date_match = re.search(r"Menampilkan data tanggal\s+(\d{4}-\d{2}-\d{2})", html)
    monitor_date = parse_date(date_match.group(1)) if date_match else date.today()

    market_name = "Wonosobo"
    selected_market = re.search(
        r'<option value="[^"]*"\s+selected[^>]*>(.*?)</option>', html, re.DOTALL
    )
    if selected_market:
        market_name = _strip_html(selected_market.group(1)) or market_name

    rows = []
    row_pattern = re.compile(
        r'<tr class="hover:bg-slate-50/70 transition-colors">(.*?)</tr>', re.DOTALL
    )
    for row_html in row_pattern.findall(html):
        name_match = re.search(
            r'<td class="pl-6 py-4 font-medium text-slate-800">\s*(.*?)\s*<span',
            row_html,
            re.DOTALL,
        )
        category_match = re.search(
            r'<span class="block text-xs font-normal text-slate-400 mt-0.5">\s*(.*?)\s*</span>',
            row_html,
            re.DOTALL,
        )
        unit_match = re.search(
            r'<td class="py-4 text-slate-600 font-medium">\s*(.*?)\s*</td>',
            row_html,
            re.DOTALL,
        )
        price_match = re.search(
            r'<td class="py-4 text-right font-bold text-indigo-600 text-base">\s*(.*?)\s*</td>',
            row_html,
            re.DOTALL,
        )
        grafik_match = re.search(r'<a href="([^"]*grafik_komoditas_id=\d+[^"]*)"', row_html)

        commodity_id = None
        if grafik_match:
            qs = parse_qs(urlparse(grafik_match.group(1)).query)
            raw_id = qs.get("grafik_komoditas_id", [None])[0]
            try:
                commodity_id = int(raw_id) if raw_id is not None else None
            except (TypeError, ValueError):
                commodity_id = None

        commodity_name = _strip_html(name_match.group(1)) if name_match else "Tidak diketahui"
        category = _strip_html(category_match.group(1)) if category_match else "-"
        unit = _strip_html(unit_match.group(1)) if unit_match else "kg"
        price_text = _strip_html(price_match.group(1)) if price_match else "0"

        rows.append(
            {
                "id": commodity_id,
                "name": commodity_name,
                "nama": commodity_name,
                "kategori": category,
                "satuan": unit,
                "unit": unit,
                "harga": price_text,
                "harga_pasar": price_text,
                "lokasi": market_name,
                "pasar": market_name,
                "tanggal": monitor_date.isoformat(),
                "produk": {"name": commodity_name},
                "kategori_komoditas": {"name": category},
                "updated_at": monitor_date.isoformat(),
            }
        )

    return {
        "rows": rows,
        "market_name": market_name,
        "monitor_date": monitor_date,
    }

def fetch_realtime_komoditas() -> List[Dict]:
    """
    Mengambil data komoditas real-time dari halaman harga pasar.
    """
    try:
        parsed = _fetch_harga_pasar_rows()
        return parsed["rows"]
    except Exception as e:
        logger.error(f"[ERROR] Error fetching komoditas: {e}")
        return []

def fetch_realtime_produk_komoditas() -> List[Dict]:
    """
    Mengambil data produk komoditas real-time dari halaman harga pasar.
    """
    try:
        parsed = _fetch_harga_pasar_rows()
        return parsed["rows"]
    except Exception as e:
        logger.error(f"[ERROR] Error fetching produk-komoditas: {e}")
        return []

def fetch_realtime_produk() -> List[Dict]:
    """
    Mengambil data produk real-time dari halaman harga pasar.
    """
    try:
        parsed = _fetch_harga_pasar_rows()
        return parsed["rows"]
    except Exception as e:
        logger.error(f"[ERROR] Error fetching produk: {e}")
        return []

def get_realtime_market_prices() -> Dict:
    """
    Mengambil data harga pasar real-time dari halaman harga-pasar.
    """
    try:
        all_prices = []
        
        # Fetch dari halaman harga-pasar (sumber utama data harga)
        produk_komoditas = fetch_realtime_produk_komoditas()
        logger.info(f"[MARKET] Fetched {len(produk_komoditas)} items from harga-pasar")
        
        for item in produk_komoditas:
            # Extract nama dari nested object produk.name
            nama = "Tidak diketahui"
            if isinstance(item.get("produk"), dict) and item["produk"].get("name"):
                nama = item["produk"]["name"]
            elif item.get("name"):
                nama = item["name"]
            elif item.get("nama"):
                nama = item["nama"]
            
            # Extract harga dari harga_pasar
            harga = parse_price(item.get("harga_pasar") or item.get("harga") or 0)
            
            # Extract kategori dari nested object
            kategori = "-"
            if isinstance(item.get("kategori_komoditas"), dict):
                kategori = item["kategori_komoditas"].get("name", "-")
            elif item.get("kategori"):
                kategori = item["kategori"]
            
            price_data = {
                "commodity_name": nama,
                "category": kategori,
                "unit": item.get("unit") or item.get("satuan") or "kg",
                "price": harga,
                "market_location": item.get("pasar") or item.get("lokasi") or "Wonosobo",
                "date": parse_date(item.get("tgl") or item.get("tanggal") or item.get("updated_at")),
                "source": "harga-pasar"
            }
            all_prices.append(price_data)
            logger.info(f"  [MARKET] Added: {nama} - Rp {harga}")
        
        return {
            "success": True,
            "total": len(all_prices),
            "data": all_prices,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"[ERROR] Error getting realtime prices: {e}")
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
            logger.warning("[WARNING] Tidak ada data dari halaman harga-pasar Disdagkopukm.")
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
                user_id=None,  # Biarkan NULL untuk data dari API
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

        logger.info(f"[MARKET] {count} data baru berhasil disimpan dari halaman harga-pasar Disdagkopukm.")
        return {
            "message": f"{count} data berhasil disimpan ke database.",
            "total_fetched": realtime_data["total"]
        }

    except requests.exceptions.RequestException as e:
        logger.error(f"[ERROR] Gagal menghubungi sumber harga-pasar Disdagkopukm: {e}")
        return {"error": f"Gagal menghubungi sumber harga-pasar: {e}"}

    except Exception as e:
        logger.error(f"[ERROR] Gagal sinkronisasi data: {e}")
        return {"error": str(e)}
