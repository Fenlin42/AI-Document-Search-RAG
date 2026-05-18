# backend/app/routes/upload.py
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.services.pdf_parser import extract_chunks
from app.services.pinecone_db import store_chunks

logger = logging.getLogger(__name__)

router = APIRouter()


class UploadResponse(BaseModel):
    filename: str
    chunks_count: int
    status: str


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Nur PDF-Dateien erlaubt.")

    pdf_bytes = await file.read()

    if len(pdf_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Datei zu gross (max. 20 MB).")

    try:
        chunks = extract_chunks(pdf_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        count = store_chunks(chunks)
    except Exception as e:
        logger.exception("Fehler beim Speichern der Chunks")
        raise HTTPException(status_code=500, detail=f"Embedding/Speicher-Fehler: {e}")

    return UploadResponse(
        filename=file.filename,
        chunks_count=count,
        status="success",
    )
