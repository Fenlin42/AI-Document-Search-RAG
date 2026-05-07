// frontend/src/App.jsx
import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import PDFUploader from "./components/PDFUploader";
import DocumentList from "./components/DocumentList";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [documents, setDocuments] = useState([]);

  const handleUploadSuccess = (doc) => {
    setDocuments((prev) => [...prev, doc]);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-600/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-accent/20">
            R
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">RAG Chatbot</h1>
            <p className="text-xs text-gray-500">
              PDF hochladen &middot; Fragen stellen &middot; Antworten erhalten
            </p>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-80 border-r border-dark-600/50 p-4 flex flex-col gap-4 hidden md:flex">
          <PDFUploader apiUrl={API_URL} onSuccess={handleUploadSuccess} />
          <DocumentList documents={documents} />
        </aside>

        {/* Chat */}
        <section className="flex-1 flex flex-col">
          <ChatWindow apiUrl={API_URL} />
        </section>
      </main>
    </div>
  );
}
