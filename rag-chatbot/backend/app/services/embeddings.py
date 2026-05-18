# backend/app/services/embeddings.py
"""Embedding-Funktion via HuggingFace Inference API (kein lokales Modell, spart RAM)."""
import os
import requests
from functools import lru_cache
from langchain.embeddings.base import Embeddings

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
DIMENSION = 384
API_URL = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{MODEL_NAME}"


class HuggingFaceInferenceEmbeddings(Embeddings):
    """Embeddings ueber die kostenlose HuggingFace Inference API."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("HF_API_KEY", "")
        self.headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}

    def _embed(self, texts: list[str]) -> list[list[float]]:
        response = requests.post(
            API_URL,
            headers=self.headers,
            json={"inputs": texts, "options": {"wait_for_model": True}},
            timeout=60,
        )
        response.raise_for_status()
        return response.json()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        batch_size = 32
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            all_embeddings.extend(self._embed(batch))
        return all_embeddings

    def embed_query(self, text: str) -> list[float]:
        return self._embed([text])[0]


@lru_cache
def get_embedding_function() -> HuggingFaceInferenceEmbeddings:
    return HuggingFaceInferenceEmbeddings()
