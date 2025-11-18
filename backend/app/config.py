from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:rezky17@localhost:5432/ecoscope"
    secret_key: str = "supersecretkey"

    class Config:
        env_file = ".env"  # kalau nanti mau pindah ke file .env

settings = Settings()
