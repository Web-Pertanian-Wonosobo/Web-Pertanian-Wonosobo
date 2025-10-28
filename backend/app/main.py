from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weather, market

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
