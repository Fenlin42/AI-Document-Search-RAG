# backend/app/routes/chat.py
import json
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.services.rag_chain import stream_answer

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    chat_history: list[dict] = []


@router.post("/chat")
async def chat(request: ChatRequest):
    async def event_generator():
        try:
            async for token in stream_answer(request.question, request.chat_history):
                yield {"data": json.dumps({"token": token})}
            yield {"data": json.dumps({"done": True})}
        except Exception as e:
            logger.exception("Fehler in der RAG-Pipeline")
            yield {"data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
