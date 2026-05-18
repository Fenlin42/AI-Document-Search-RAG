# AI Document Search — RAG Chatbot

A PDF-powered chatbot that answers questions based on your uploaded documents. Built with a modern RAG (Retrieval-Augmented Generation) pipeline — no hallucinations, only answers grounded in your data.

**[Live Demo](https://ai-document-search-rag.vercel.app)** · **[GitHub](https://github.com/Fenlin42/AI-Document-Search-RAG)**

---

## How It Works

```
1. Upload a PDF           →  Text extraction with PyMuPDF
2. Text gets chunked      →  Smart splitting (500 chars, 100 overlap)
3. Chunks get embedded    →  HuggingFace Inference API (MiniLM-L6-v2)
4. Vectors stored         →  Pinecone (cosine similarity)
5. User asks a question   →  Query reformulation from chat context
6. Relevant chunks found  →  Semantic search (top 8 results)
7. LLM generates answer   →  Groq (Llama 3.1 8B) with SSE streaming
```

### Key Features

- **Streaming Responses** — answers appear token by token in real-time via SSE
- **Query Reformulation** — follow-up questions like _"what are the symptoms?"_ are automatically rewritten using chat history (_"What are the symptoms of sleep deprivation?"_)
- **Grounded Answers** — the bot only answers from the uploaded document, never invents facts
- **Dark Mode UI** — cyan neon accents, typing indicator, timestamps, code copy button

---

## Tech Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React + Tailwind CSS + Vite | Vercel (free) |
| Backend | FastAPI + LangChain | Docker → Render (free) |
| LLM | Groq (Llama 3.1 8B Instant) | Groq free tier |
| Vector DB | Pinecone | Free tier |
| Embeddings | HuggingFace Inference API (MiniLM-L6-v2) | Free tier |
| PDF Parsing | PyMuPDF | — |

**Total cost: $0** — entirely built on free tiers.

---

## Architecture

```
┌──────────────┐        ┌──────────────────────────────────────┐
│  PDF Upload  │        │           Chat Question              │
│      │       │        │               │                      │
│      ▼       │        │               ▼                      │
│   PyMuPDF    │        │     Query Reformulation (Groq)       │
│   (extract)  │        │    "symptoms" → "symptoms of X"      │
│      │       │        │               │                      │
│      ▼       │        │               ▼                      │
│   Chunking   │        │     Embedding (MiniLM-L6-v2)         │
│  (500 chars) │        │               │                      │
│      │       │        │               ▼                      │
│      ▼       │        │     Pinecone Similarity Search       │
│  Embedding   │        │      (top 8 relevant chunks)         │
│  (MiniLM)    │        │               │                      │
│      │       │        │               ▼                      │
│      ▼       │        │      Groq LLM (Llama 3.1 8B)        │
│   Pinecone   │───────▶│     System Prompt + Context          │
│   (store)    │        │               │                      │
│              │        │               ▼                      │
└──────────────┘        │      SSE Stream → Frontend           │
                        └──────────────────────────────────────┘
```

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Groq API Key](https://console.groq.com) (free)
- [Pinecone API Key](https://app.pinecone.io) (free)
- [HuggingFace Token](https://huggingface.co/settings/tokens) (free, read-only)

### Backend

```bash
cd rag-chatbot/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Add your API keys to .env

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd rag-chatbot/frontend
npm install
npm run dev
```

Open **http://localhost:5173** — upload a PDF and start chatting.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/upload` | Upload a PDF (multipart/form-data) |
| `POST` | `/chat` | Ask a question (returns SSE stream) |

```bash
# Health check
curl http://localhost:8000/health

# Upload PDF
curl -X POST http://localhost:8000/upload -F "file=@document.pdf"

# Chat (SSE stream)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this document about?", "chat_history": []}'
```

---

## Deployment

| Service | Configuration |
|---|---|
| **Render** (Backend) | Docker runtime, root: `rag-chatbot/backend`, env vars: `GROQ_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `HF_API_KEY` |
| **Vercel** (Frontend) | Vite framework, root: `rag-chatbot/frontend`, env var: `VITE_API_URL=https://your-backend.onrender.com` |

---

## Project Structure

```
rag-chatbot/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ChatWindow.jsx    # Chat UI with SSE streaming
│       │   ├── PDFUploader.jsx   # Drag & drop PDF upload
│       │   └── DocumentList.jsx  # Uploaded documents list
│       └── App.jsx               # Split-view layout
└── backend/
    └── app/
        ├── routes/
        │   ├── upload.py         # PDF upload endpoint
        │   └── chat.py           # Chat endpoint (SSE)
        ├── services/
        │   ├── pdf_parser.py     # PyMuPDF text extraction + chunking
        │   ├── embeddings.py     # HuggingFace Inference API
        │   ├── pinecone_db.py    # Vector storage + similarity search
        │   └── rag_chain.py      # Query reformulation + Groq LLM
        ├── config.py             # Pydantic settings
        └── main.py               # FastAPI app
```

---

Built by **Fenlin Chirakkal** · Basel, Switzerland

MIT License
