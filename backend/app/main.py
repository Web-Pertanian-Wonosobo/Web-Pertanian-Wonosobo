from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weather, market, auth, wilayah, forecast

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
app.include_router(wilayah.router)  # Router already has /wilayah prefix
app.include_router(forecast.router)  # Router already has /forecast prefix
# app.include_router(predict.router)  # Temporarily disabled 

# Environment variable untuk enable/disable auto-sync
import os
AUTO_SYNC_ENABLED = os.getenv("AUTO_SYNC_ENABLED", "true").lower() == "true"
SYNC_INTERVAL_HOURS = int(os.getenv("SYNC_INTERVAL_HOURS", "24"))  # Default 24 jam

# Startup event - Auto-sync + Scheduler
@app.on_event("startup")
def startup_event():
    # Manual sync once saat startup
    from app.services.market_sync import fetch_and_save_market_data
    try:
        result = fetch_and_save_market_data()
        print(f"✅ Initial sync completed: {result}")
    except Exception as e:
        print(f"⚠️ Initial sync failed: {e}")
    
    # Enable scheduler untuk auto-sync harian
    if AUTO_SYNC_ENABLED:
        try:
            from app.scheduler import start_scheduler_with_interval
            start_scheduler_with_interval(hours=SYNC_INTERVAL_HOURS)
            print(f"✅ Auto-sync scheduler enabled (every {SYNC_INTERVAL_HOURS} hours)")
        except Exception as e:
            print(f"⚠️ Scheduler failed to start: {e}")
            print("📝 Manual sync masih bisa dilakukan via POST /market/sync")
    else:
        print("ℹ️ Auto-sync disabled. Use POST /market/sync for manual sync")

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
