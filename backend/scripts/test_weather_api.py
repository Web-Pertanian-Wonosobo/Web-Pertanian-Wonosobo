import requests
import json

def test_weather_prediction():
    # Koordinat Wadaslintang
    lat = -7.5167
    lon = 109.9167
    location = "Wadaslintang"
    
    url = f"http://localhost:8000/weather/predict/coordinates?lat={lat}&lon={lon}&location_name={location}&days=7"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Status: {data['status']}")
            print(f"Predictions: {len(data['predictions'])}")
            if data['predictions']:
                print(f"First Prediction: {data['predictions'][0]}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_weather_prediction()
