import requests
import json

def test_forecast():
    url = "http://localhost:8000/forecast/commodity/Kacang Panjang"
    params = {
        "days_forward": 30,
        "days_back": 90,
        "use_synthetic": True
    }
    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data['success']}")
            print(f"Model: {data['model']}")
            print(f"Predictions: {len(data['predictions'])}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_forecast()
