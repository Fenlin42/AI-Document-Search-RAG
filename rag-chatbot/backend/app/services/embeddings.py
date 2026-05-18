# backend/app/services/embeddings.py
"""Embedding-Funktion via HuggingFace Inference API (kein lokales Modell, spart RAM)."""
import os
from functools import lru_cache
from huggingface_hub import InferenceClient
from langchain.embeddings.base import Embeddings

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
DIMENSION = 384


class HFInferenceEmbeddings(Embeddings):
    """Embeddings ueber die HuggingFace Inference API."""

    def __init__(self):
        token = os.getenv("HF_API_KEY", "")
        self.client = InferenceClient(token=token)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self.client.feature_extraction(t, model=MODEL_NAME).tolist() for t in texts]

    def embed_query(self, text: str) -> list[float]:
        return self.client.feature_extraction(text, model=MODEL_NAME).tolist()


@lru_cache
def get_embedding_function() -> HFInferenceEmbeddings:
    return HFInferenceEmbeddings()
