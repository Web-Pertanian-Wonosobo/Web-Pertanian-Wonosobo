from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.routers import weather, market

# Konfigurasi logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title="Web Petani Wonosobo API",
    description="API untuk integrasi data cuaca BMKG dan harga komoditas Bapanas",
    version="1.0.0"
)

# Konfigurasi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(market.router, prefix="/api/market", tags=["Market"])

@app.get("/")
def root():
    return {
        "message": "Backend siap jalan 🚀",
        "version": "1.0.0",
        "endpoints": {
            "weather": "/api/weather",
            "market": "/api/market",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": "2025-09-28"}
