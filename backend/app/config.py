from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://admin:admin123@localhost:5432/escoscope"
    secret_key: str = "supersecretkey"

    class Config:
        env_file = ".env"  # kalau nanti mau pindah ke file .env

settings = Settings()
