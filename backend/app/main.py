from fastapi import FastAPI
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weather, market, auth

#load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")

# Validate DATABASE_URL
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# create database engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
app = FastAPI(
    title="Web Petani Wonosobo API",
    description="API untuk data cuaca, harga pasar, dan prediksi pertanian",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(weather.router)  # Router already has /weather prefix
app.include_router(market.router)  # Router already has /market prefix
app.include_router(auth.router)  # Router already has /auth prefix
# app.include_router(predict.router)  # Temporarily disabled 

# Startup event - Run sync once, tanpa scheduler continuous (sementara disabled)
@app.on_event("startup")
def startup_event():
    # Manual sync once saat startup
    from app.services.market_sync import fetch_and_save_market_data
    try:
        result = fetch_and_save_market_data()
        print(f"✅ Initial sync completed: {result}")
    except Exception as e:
        print(f"⚠️ Initial sync failed: {e}")
    
    # TODO: Fix scheduler crash issue, untuk sekarang pakai manual sync dulu
    # from app.scheduler import start_scheduler
    # start_scheduler()

# Shutdown event
@app.on_event("shutdown")
def shutdown_event():
    print("🛑 Backend stopped")

@app.get("/")
def root():
    return {
        "message": "Backend siap jalan 🚀",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth",
            "weather": "/weather",
            "market": "/market",
            "predict": "/predict",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Web Petani Wonosobo API"
    }
