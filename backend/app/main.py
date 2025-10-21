from fastapi import FastAPI
from app.routers import weather, market, admin, public

app = FastAPI(title="Web Petani Wonosobo API")

app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(market.router, prefix="/market", tags=["Market"])

@app.get("/")
def root():
    return {"message": "Backend siap jalan 🚀"}
