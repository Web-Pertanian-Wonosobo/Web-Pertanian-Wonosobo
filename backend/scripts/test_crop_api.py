import requests
import json

def test_crop_recommendation():
    location = "Wadaslintang"
    url = f"http://localhost:8000/crops/recommend?location={location}&days=7"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Status: {data['status']}")
            print(f"Highly Recommended: {len(data['recommendations']['highly_recommended'])}")
            if data['recommendations']['highly_recommended']:
                print(f"First Crop: {data['recommendations']['highly_recommended'][0]['data']['name']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_crop_recommendation()
