# backend/app/services/rag_chain.py
from collections.abc import AsyncIterator

from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import AIMessage, HumanMessage

from app.config import get_settings
from app.services.pinecone_db import search

SYSTEM_PROMPT = """Du bist ein hilfreicher Assistent. Beantworte Fragen basierend auf dem
bereitgestellten Kontext. Wenn der Kontext keine Antwort liefert, sag das ehrlich.
Antworte in der Sprache, in der die Frage gestellt wurde.

Kontext:
{context}"""


def _build_llm() -> ChatGroq:
    settings = get_settings()
    return ChatGroq(
        api_key=settings.groq_api_key,
        model_name="llama3-8b-8192",
        temperature=0.3,
        streaming=True,
    )


def _format_history(chat_history: list[dict]) -> list[HumanMessage | AIMessage]:
    """Chat-History in LangChain-Messages umwandeln."""
    messages = []
    for msg in chat_history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))
    return messages


async def stream_answer(question: str, chat_history: list[dict]) -> AsyncIterator[str]:
    """RAG-Pipeline: Query → Pinecone → Groq → streamed Antwort."""
    docs = search(question, top_k=5)
    context = "\n\n---\n\n".join(doc.page_content for doc in docs)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ])

    llm = _build_llm()
    chain = prompt | llm

    history_messages = _format_history(chat_history)

    async for chunk in chain.astream({
        "context": context,
        "chat_history": history_messages,
        "question": question,
    }):
        if hasattr(chunk, "content") and chunk.content:
            yield chunk.content
