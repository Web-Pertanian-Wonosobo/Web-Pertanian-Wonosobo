from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weather, market
from app.middleware.rbac_middleware import RBACMiddleware

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

# RBAC Middleware
app.add_middleware(RBACMiddleware)

# Include routers
app.include_router(weather.router)  # Router already has /weather prefix
app.include_router(market.router)  # Router already has /market prefix
# app.include_router(predict.router)  # Temporarily disabled 

# Startup event - Start scheduler (optional, uncomment to enable auto-sync)
# @app.on_event("startup")
# def startup_event():
#     from app.scheduler import start_scheduler
#     start_scheduler()

# Shutdown event
# @app.on_event("shutdown")
# def shutdown_event():
#     from app.scheduler import stop_scheduler
#     stop_scheduler()

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
