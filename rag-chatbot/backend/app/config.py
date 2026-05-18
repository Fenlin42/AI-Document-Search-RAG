# backend/app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    groq_api_key: str
    pinecone_api_key: str
    pinecone_index_name: str = "rag-chatbot"

    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    # Vercel-Domain wird ueber ALLOWED_ORIGINS env var ergaenzt:
    # ALLOWED_ORIGINS='["http://localhost:5173","https://dein-projekt.vercel.app"]'

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
