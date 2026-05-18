# backend/app/services/rag_chain.py
from collections.abc import AsyncIterator

from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import AIMessage, HumanMessage

from app.config import get_settings
from app.services.pinecone_db import search

SYSTEM_PROMPT = """Du bist ein präziser Dokumenten-Assistent. Deine EINZIGE Wissensquelle ist der unten stehende Kontext.

STRIKTE Regeln:
1. Antworte AUSSCHLIESSLICH mit Informationen, die WÖRTLICH im Kontext stehen. Keine Interpretation, keine Schlussfolgerungen, keine Ergänzungen aus deinem eigenen Wissen.
2. Zitiere relevante Details, Zahlen und Begriffe direkt aus dem Kontext.
3. Wenn der Kontext die Frage nicht DIREKT beantwortet, sag: "Dazu habe ich in den hochgeladenen Dokumenten keine Information gefunden."
4. Antworte in der Sprache der Frage.
5. Strukturiere längere Antworten mit Aufzählungen oder kurzen Absätzen.
6. Erfinde NIEMALS Fakten, Beispiele oder Details, die nicht wortwörtlich im Kontext stehen.
7. Wenn du dir nicht sicher bist, ob eine Information im Kontext steht, gib sie NICHT wieder.

Kontext aus den hochgeladenen Dokumenten:
---
{context}
---"""

REFORMULATE_PROMPT = """Gegeben ist ein Chatverlauf und eine Folgefrage. Formuliere die Folgefrage als eigenständige Suchanfrage um, die ohne den Chatverlauf verständlich ist. Gib NUR die umformulierte Frage zurück, nichts anderes.

Chatverlauf:
{history}

Folgefrage: {question}

Eigenständige Suchanfrage:"""


def _build_llm(streaming: bool = True) -> ChatGroq:
    settings = get_settings()
    return ChatGroq(
        api_key=settings.groq_api_key,
        model_name="llama-3.1-8b-instant",
        temperature=0.1,
        streaming=streaming,
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


async def _reformulate_query(question: str, chat_history: list[dict]) -> str:
    """Folgefrage mit Chat-Kontext in eine eigenstaendige Suchanfrage umschreiben."""
    if not chat_history:
        return question

    history_text = "\n".join(
        f"{'User' if m['role'] == 'user' else 'Bot'}: {m['content'][:200]}"
        for m in chat_history[-6:]
    )

    llm = _build_llm(streaming=False)
    prompt = ChatPromptTemplate.from_template(REFORMULATE_PROMPT)
    chain = prompt | llm

    result = await chain.ainvoke({"history": history_text, "question": question})
    return result.content.strip()


async def stream_answer(question: str, chat_history: list[dict]) -> AsyncIterator[str]:
    """RAG-Pipeline: Query Reformulation → Pinecone → Groq → streamed Antwort."""
    search_query = await _reformulate_query(question, chat_history)
    docs = search(search_query, top_k=8)
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
