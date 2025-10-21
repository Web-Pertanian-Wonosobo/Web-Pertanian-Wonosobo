from fastapi import APIRouter
from app.services.ai_market import predict_price, train_price_models

router = APIRouter(prefix="/predict", tags=["AI Prediction"])

@router.get("/price")
def get_prediction(commodity_name: str, market_location: str, days_ahead: int = 7):
    """
    Endpoint untuk mendapatkan prediksi harga berdasarkan komoditas dan pasar.
    """
    return predict_price(commodity_name, market_location, days_ahead)

@router.post("/train")
def train_models():
    """
    Endpoint untuk melatih ulang semua model harga dari data di database.
    """
    train_price_models()
    return {"message": "Model retraining selesai"}
