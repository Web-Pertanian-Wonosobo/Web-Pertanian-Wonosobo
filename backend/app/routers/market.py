from fastapi import APIRouter

router = APIRouter()

@router.get("/price")
def get_price():
    return {"commodity": "Cabai", "price": 25000}
