// frontend/src/App.jsx
import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import PDFUploader from "./components/PDFUploader";
import DocumentList from "./components/DocumentList";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleUploadSuccess = (doc) => {
    setDocuments((prev) => [...prev, doc]);
  };

  return (
    <div className="h-screen bg-dark-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-neon/10 bg-dark-900/80 backdrop-blur-sm px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neon/10 flex items-center justify-center border border-neon/20">
              <svg className="w-5 h-5 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight">RAG Chatbot</h1>
              <p className="text-[11px] text-gray-500">by Fenlin Chirakkal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Groq + Pinecone
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-neon transition-all md:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Linkes Panel – Dokumente */}
        <aside className={`${sidebarOpen ? "flex" : "hidden"} md:flex w-full md:w-80 lg:w-96 flex-col border-r border-neon/10 bg-dark-900/50 flex-shrink-0 overflow-hidden`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <PDFUploader apiUrl={API_URL} onSuccess={handleUploadSuccess} />
            <DocumentList documents={documents} />
          </div>

          <div className="border-t border-neon/5 px-4 py-3">
            <p className="text-[10px] text-gray-600 text-center leading-relaxed">
              Built by <span className="text-neon/40 font-medium">Fenlin Chirakkal</span>
            </p>
            <p className="text-[9px] text-gray-700 text-center mt-0.5">
              Llama 3 · Pinecone · LangChain · FastAPI
            </p>
          </div>
        </aside>

        {/* Rechtes Panel – Chat */}
        <section className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? "hidden md:flex" : "flex"}`}>
          <ChatWindow apiUrl={API_URL} />
        </section>
      </main>
    </div>
  );
}
