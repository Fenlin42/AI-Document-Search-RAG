# backend/app/services/pdf_parser.py
import fitz
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document


def extract_chunks(pdf_bytes: bytes, filename: str) -> list[Document]:
    """PDF-Bytes einlesen, Text extrahieren und in Chunks aufteilen."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()

    if not full_text.strip():
        raise ValueError(f"Kein Text in '{filename}' gefunden – ist das PDF leer oder ein Scan?")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.create_documents(
        texts=[full_text],
        metadatas=[{"source": filename}],
    )

    return chunks
