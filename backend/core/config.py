from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    SECRET_KEY: str = "cok_gizli_bir_anahtar_buraya_yazin"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # --- YENİ SATIRI BURAYA EKLEYİN ---
    openai_api_key: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()