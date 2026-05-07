# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import upload, chat

app = FastAPI(
    title="RAG Chatbot API",
    version="1.0.0",
    description="PDF-basierter RAG Chatbot mit Groq + Pinecone",
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(chat.router, tags=["Chat"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "llama3-8b-8192", "vector_db": "pinecone"}
