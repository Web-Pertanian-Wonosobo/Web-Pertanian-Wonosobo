from fastapi import APIRouter

router = APIRouter()

@router.get("/forecast")
def get_weather_forecast():
    return {"location": "Wonosobo", "forecast": "Cerah berawan", "temperature": 24}
