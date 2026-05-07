# RAG Chatbot

PDF-basierter RAG Chatbot mit React-Frontend und FastAPI-Backend.
Lade PDFs hoch, stelle Fragen – der Chatbot antwortet basierend auf deinen Dokumenten.

## Tech Stack

| Komponente | Technologie |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI + LangChain |
| LLM | Groq API (Llama 3 8B) |
| Vector DB | Pinecone (Free Tier) |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 |
| PDF Parsing | PyMuPDF |

## Voraussetzungen

- Python 3.11+
- Node.js 18+
- [Groq API Key](https://console.groq.com) (kostenlos)
- [Pinecone API Key](https://app.pinecone.io) (kostenlos)

## Lokales Setup

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# .env erstellen
cp .env.example .env
# Trage deine API Keys in .env ein

uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install

# Optional: Backend-URL aendern (default: http://localhost:8000)
# Erstelle .env mit: VITE_API_URL=http://localhost:8000

npm run dev
```

Frontend laeuft auf `http://localhost:5173`, Backend auf `http://localhost:8000`.

## API Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| GET | `/health` | Health Check |
| POST | `/upload` | PDF hochladen |
| POST | `/chat` | Frage stellen (SSE Stream) |

### Beispiele

```bash
# Health Check
curl http://localhost:8000/health

# PDF hochladen
curl -X POST http://localhost:8000/upload \
  -F "file=@dokument.pdf"

# Chat (SSE Stream)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Worum geht es im Dokument?", "chat_history": []}'
```

## Deployment

### Backend → Render.com (Docker)

1. Erstelle ein neues **Web Service** auf [render.com](https://render.com)
2. Verbinde dein GitHub Repo
3. Waehle **Docker** als Runtime
4. Setze Root Directory auf `backend`
5. Fuege die Environment Variables hinzu:
   - `GROQ_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME`

### Frontend → Vercel

1. Erstelle ein neues Projekt auf [vercel.com](https://vercel.com)
2. Verbinde dein GitHub Repo
3. Setze Root Directory auf `frontend`
4. Fuege Environment Variable hinzu:
   - `VITE_API_URL=https://dein-backend.onrender.com`
5. Trage die Vercel-Domain in `backend/app/config.py` unter `allowed_origins` ein

## Architektur

```
User → React Frontend → FastAPI Backend
                              ↓
                    PDF → PyMuPDF → Chunks
                              ↓
                    Chunks → MiniLM Embeddings → Pinecone
                              ↓
                    Query → Pinecone Search → Groq LLM → SSE Stream → Frontend
```

## Lizenz

MIT
