from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://admin:admin123@localhost:5432/escoscope"
    secret_key: str = "supersecretkey"
    auto_sync_enabled: bool = True
    sync_interval_hours: int = 24

    class Config:
        env_file = ".env"
        extra = "allow"  # Allow extra fields from .env

settings = Settings()
