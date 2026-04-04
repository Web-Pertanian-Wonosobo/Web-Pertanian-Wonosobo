from pathlib import Path

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://admin:admin123@localhost:5432/escoscope"
    secret_key: str = "supersecretkey"
    auto_sync_enabled: bool = True
    sync_interval_hours: int = 24
    OPENWEATHER_BASE_URL: str = "https://api.openweathermap.org/data/2.5"
    OPENWEATHER_API_KEY: str = ""

    class Config:
        env_file = str(Path(__file__).resolve().parents[1] / ".env")
        extra = "allow"  # Allow extra fields from .env

settings = Settings()
