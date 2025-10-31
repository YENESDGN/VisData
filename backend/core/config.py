# app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str

    # YENİ EKLENEN ALANLAR
    SECRET_KEY: str = "cok_gizli_bir_anahtar_buraya_yazin"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"


settings = Settings()