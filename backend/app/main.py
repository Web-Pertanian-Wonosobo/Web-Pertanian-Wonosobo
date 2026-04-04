import os
from pathlib import Path

from dotenv import load_dotenv
import logging
from sqlalchemy import create_engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException
from app.config import settings
from app.routers import weather, market, auth, wilayah, forecast, crops, users
import logging

# Load environment variables from backend/.env (works with uvicorn --reload subprocesses)
BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=BACKEND_DIR / ".env", override=True)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL") or settings.DATABASE_URL
OPENWEATHER_BASE_URL = (os.getenv("OPENWEATHER_BASE_URL") or settings.OPENWEATHER_BASE_URL or "").strip()
OPENWEATHER_API_KEY = (os.getenv("OPENWEATHER_API_KEY") or settings.OPENWEATHER_API_KEY or "").strip()

# Normalize OpenWeather base URL to avoid typos like aapi/appi/https::// etc
if "openweathermap.org" not in OPENWEATHER_BASE_URL:
    logging.warning(f"⚠️ OPENWEATHER_BASE_URL invalid ('{OPENWEATHER_BASE_URL}'), forcing default")
    OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"
if OPENWEATHER_BASE_URL.endswith('/'):
    OPENWEATHER_BASE_URL = OPENWEATHER_BASE_URL.rstrip('/')
os.environ["OPENWEATHER_BASE_URL"] = OPENWEATHER_BASE_URL

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

# Custom exception handler untuk validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    errors = []
    for error in exc.errors():
        # Handle date objects that can't be JSON serialized
        input_value = error.get("input", "N/A")
        if hasattr(input_value, 'isoformat'):
            input_value = input_value.isoformat()
        elif not isinstance(input_value, (str, int, float, bool, type(None))):
            input_value = str(input_value)
            
        errors.append({
            "field": error["loc"][-1] if error["loc"] else "unknown",
            "message": error["msg"],
            "type": error["type"],
            "value": input_value
        })
    
    logging.error(f"❌ Validation error on {request.url}: {errors}")
    
    error_messages = []
    for e in errors:
        error_messages.append(f"{e['field']}: {e['message']}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": f"Validation failed: {'; '.join(error_messages)}",
            "errors": errors
        }
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
app.include_router(crops.router)  # Router already has /crops prefix
app.include_router(wilayah.router)  # Router already has /wilayah prefix
app.include_router(forecast.router)  # Router already has /forecast prefix
app.include_router(users.router)  # Router already has /users prefix
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
    # Disable auto-sync if OpenWeather API key missing
    if AUTO_SYNC_ENABLED and OPENWEATHER_API_KEY:
        try:
            from app.scheduler import start_scheduler_with_interval
            start_scheduler_with_interval(hours=SYNC_INTERVAL_HOURS)
            print(f"✅ Auto-sync scheduler enabled (every {SYNC_INTERVAL_HOURS} hours)")
        except Exception as e:
            print(f"⚠️ Scheduler failed to start: {e}")
            print("📝 Manual sync masih bisa dilakukan via POST /market/sync")
    else:
        print("ℹ️ Auto-sync disabled (no API key or disabled). Use POST /market/sync for manual sync")

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
