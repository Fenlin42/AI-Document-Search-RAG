// frontend/src/components/ChatWindow.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1.5 rounded-md bg-dark-700/80 border border-neon/10 hover:border-neon/30 text-gray-400 hover:text-neon transition-all text-[10px]"
    >
      {copied ? "Kopiert!" : "Kopieren"}
    </button>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      <div className="w-1.5 h-1.5 rounded-full bg-neon/50 animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-1.5 h-1.5 rounded-full bg-neon/50 animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-1.5 h-1.5 rounded-full bg-neon/50 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export default function ChatWindow({ apiUrl }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isStreaming) return;

    const chatHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const now = new Date();

    setMessages((prev) => [...prev, { role: "user", content: question, time: now }]);
    setInput("");
    setIsStreaming(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "", time: new Date() }]);

    try {
      const res = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, chat_history: chatHistory }),
      });

      if (!res.ok) throw new Error("Chat-Anfrage fehlgeschlagen");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) throw new Error(data.error);
            if (data.done) break;
            if (data.token) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + data.token,
                };
                return updated;
              });
            }
          } catch (e) {
            if (e.message && !e.message.includes("JSON")) throw e;
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `Fehler: ${err.message}`,
          time: new Date(),
          isError: true,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Nachrichten */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-neon/5 border border-neon/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-neon/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Bereit zum Chatten</p>
                <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                  Lade ein PDF hoch und stell deine erste Frage.
                  Der Bot antwortet basierend auf dem Inhalt deiner Dokumente.
                </p>
              </div>
              <div className="pt-2 border-t border-dark-500/20">
                <p className="text-[10px] text-gray-700">
                  Entwickelt von <span className="text-neon/50 font-medium">Fenlin Chirakkal</span> — RAG-Pipeline mit Groq, Pinecone & LangChain
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
            {messages.map((msg, i) => (
              <div key={i} className="animate-fade-in">
                {/* User Message */}
                {msg.role === "user" ? (
                  <div className="flex justify-end mb-4">
                    <div className="max-w-[80%]">
                      <div className="bg-neon/10 border border-neon/15 text-gray-200 px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed">
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-gray-600 mt-1 text-right pr-1">
                        {msg.time && formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Assistant Message */
                  <div className="flex justify-start mb-4">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="w-7 h-7 rounded-lg bg-neon/5 border border-neon/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-neon/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm leading-relaxed ${msg.isError ? "text-red-400" : "text-gray-300"}`}>
                          {!msg.content && isStreaming && i === messages.length - 1 ? (
                            <TypingIndicator />
                          ) : (
                            <div className="markdown-body group relative">
                              <ReactMarkdown
                                components={{
                                  pre: ({ children }) => (
                                    <div className="relative group">
                                      <pre>{children}</pre>
                                      <CopyButton text={String(children?.props?.children || "")} />
                                    </div>
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1 pl-0.5">
                          {msg.time && formatTime(msg.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-neon/5 bg-dark-900/50 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Frag etwas zu deinen PDFs..."
                disabled={isStreaming}
                className="w-full bg-dark-800 border border-dark-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon/30 focus:shadow-neon-sm transition-all disabled:opacity-40"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isStreaming || !input.trim()}
              className="h-[46px] px-4 rounded-xl bg-neon/10 border border-neon/20 text-neon hover:bg-neon/15 hover:border-neon/40 hover:shadow-neon-sm transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isStreaming ? (
                <div className="w-5 h-5 border-2 border-neon border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-700 mt-2 text-center">
            Entwickelt von <span className="text-neon/40 font-medium">Fenlin Chirakkal</span> · Antworten basieren auf hochgeladenen Dokumenten
          </p>
        </div>
      </div>
    </div>
  );
}
