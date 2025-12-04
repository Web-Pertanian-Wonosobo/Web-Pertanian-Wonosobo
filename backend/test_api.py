import requests
import json

def test_add_market_price():
    url = "http://127.0.0.1:8000/market/add"
    
    # Test data yang sederhana
    test_data = {
        "commodity_name": "Kentang",
        "market_location": "Wonosobo Kota", 
        "unit": "kg",
        "price": 15000
    }
    
    print(f"🧪 Testing with data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(
            url, 
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📄 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ ERROR {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Detail: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error Text: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure backend is running on port 8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_add_market_price()