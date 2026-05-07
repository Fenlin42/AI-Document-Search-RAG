# backend/app/services/embeddings.py
from langchain_huggingface import HuggingFaceEmbeddings
from functools import lru_cache

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
DIMENSION = 384


@lru_cache
def get_embedding_function() -> HuggingFaceEmbeddings:
    """Lokales Embedding-Modell laden (384 Dimensionen, kostenlos)."""
    return HuggingFaceEmbeddings(
        model_name=MODEL_NAME,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
