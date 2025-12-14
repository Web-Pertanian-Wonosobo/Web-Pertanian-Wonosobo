"""
Script untuk generate sample data harga komoditas
Untuk testing dan demo forecasting

Run: python generate_sample_data.py
Or with custom URL: BASE_URL=http://localhost:8080 python generate_sample_data.py
"""

import requests
import time
import os
from datetime import datetime

# Support environment variable untuk flexibility (development & production)
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8080")

# Komoditas utama Wonosobo dengan harga base (Rupiah per kg)
COMMODITIES = [
    {"name": "Kentang", "base_price": 8500, "location": "Wonosobo Kota"},
    {"name": "Bawang Merah", "base_price": 45000, "location": "Wonosobo Kota"},
    {"name": "Cabai Merah", "base_price": 35000, "location": "Wonosobo Kota"},
    {"name": "Cabai Rawit", "base_price": 55000, "location": "Wonosobo Kota"},
    {"name": "Wortel", "base_price": 7000, "location": "Wonosobo Kota"},
    {"name": "Kubis", "base_price": 5500, "location": "Wonosobo Kota"},
    {"name": "Tomat", "base_price": 12000, "location": "Wonosobo Kota"},
    {"name": "Bawang Daun", "base_price": 15000, "location": "Wonosobo Kota"},
    {"name": "Strawberry", "base_price": 45000, "location": "Kejajar"},
    {"name": "Kopi Arabika", "base_price": 85000, "location": "Kalibawang"},
]

def generate_data_for_commodity(commodity_name, base_price, days=90):
    """Generate sample data untuk satu komoditas"""
    url = f"{BASE_URL}/forecast/generate-sample-data"
    params = {
        "commodity_name": commodity_name,
        "base_price": base_price,
        "days": days
    }
    
    try:
        print(f"📊 Generating data for {commodity_name}... ", end="")
        response = requests.post(url, params=params)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {result.get('records_created', 0)} records created")
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_server():
    """Check if server is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except:
        return False

def main():
    print("=" * 60)
    print("🌾 Sample Data Generator - Web Pertanian Wonosobo")
    print("=" * 60)
    print(f"🔗 Using backend URL: {BASE_URL}")
    print()
    
    # Check server
    print("🔍 Checking backend server...")
    if not check_server():
        print("❌ Backend server not running!")
        print("💡 Please start backend first:")
        print("   cd backend")
        print("   uvicorn app.main:app --reload")
        print()
        print("💡 Or specify custom URL:")
        print(f"   BASE_URL=http://localhost:8000 python {__file__}")
        return
    print("✅ Backend server is running")
    print()
    
    # Generate data
    print(f"📦 Generating data for {len(COMMODITIES)} commodities...")
    print(f"📅 Data range: 90 days historical data")
    print()
    
    success_count = 0
    for commodity in COMMODITIES:
        if generate_data_for_commodity(
            commodity["name"], 
            commodity["base_price"],
            days=90
        ):
            success_count += 1
        time.sleep(0.5)  # Small delay to avoid overwhelming server
    
    print()
    print("=" * 60)
    print(f"✅ Successfully generated data for {success_count}/{len(COMMODITIES)} commodities")
    print("=" * 60)
    print()
    print("📊 Summary:")
    print(f"   - Total commodities: {len(COMMODITIES)}")
    print(f"   - Records per commodity: 90 days")
    print(f"   - Total records: ~{success_count * 90}")
    print()
    print("🎯 Next steps:")
    print("   1. Open frontend: http://localhost:5173")
    print("   2. Navigate to 'Prediksi Harga'")
    print("   3. Select a commodity and try forecasting!")
    print()
    print("🔍 Test forecasting API:")
    print("   curl 'http://127.0.0.1:8000/forecast/commodity/Kentang?days_forward=30'")
    print()

if __name__ == "__main__":
    main()
