# backend/app/routes/chat.py
import json
from fastapi import APIRouter
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.services.rag_chain import stream_answer

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    chat_history: list[dict] = []


@router.post("/chat")
async def chat(request: ChatRequest):
    async def event_generator():
        async for token in stream_answer(request.question, request.chat_history):
            yield {"data": json.dumps({"token": token})}
        yield {"data": json.dumps({"done": True})}

    return EventSourceResponse(event_generator())
