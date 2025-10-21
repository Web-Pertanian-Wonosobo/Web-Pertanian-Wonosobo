from fastapi import FastAPI
from app.routers import weather, market, predict
from app.services import market_sync  

app = FastAPI(title="Web Petani Wonosobo API")

app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(market.router, prefix="/market", tags=["Market"])
app.include_router(predict.router, prefix="/predict", tags=["Predict"])
app.include_router(market_sync.router, prefix="/market-sync", tags=["Market Sync"]) 

@app.get("/")
def root():
    return {"message": "Backend siap jalan 🚀"}
