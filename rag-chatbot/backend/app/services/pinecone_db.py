# backend/app/services/pinecone_db.py
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain.schema import Document

from app.config import get_settings
from app.services.embeddings import get_embedding_function, DIMENSION

_vector_store: PineconeVectorStore | None = None


def _get_or_create_index():
    """Pinecone-Index erstellen falls er noch nicht existiert."""
    settings = get_settings()
    pc = Pinecone(api_key=settings.pinecone_api_key)

    existing = [idx.name for idx in pc.list_indexes()]
    if settings.pinecone_index_name not in existing:
        pc.create_index(
            name=settings.pinecone_index_name,
            dimension=DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    return pc.Index(settings.pinecone_index_name)


def get_vector_store() -> PineconeVectorStore:
    """Singleton VectorStore zurueckgeben."""
    global _vector_store
    if _vector_store is None:
        settings = get_settings()
        _vector_store = PineconeVectorStore(
            index=_get_or_create_index(),
            embedding=get_embedding_function(),
            text_key="text",
        )
    return _vector_store


def clear_index() -> None:
    """Alle Vektoren im Index loeschen (vor neuem Upload)."""
    index = _get_or_create_index()
    try:
        index.delete(delete_all=True)
    except Exception:
        pass


def store_chunks(chunks: list[Document]) -> int:
    """Index leeren und neue Chunks als Vektoren speichern."""
    clear_index()
    vs = get_vector_store()
    vs.add_documents(chunks)
    return len(chunks)


def search(query: str, top_k: int = 5) -> list[Document]:
    """Relevante Chunks per Similarity Search finden."""
    vs = get_vector_store()
    return vs.similarity_search(query, k=top_k)
