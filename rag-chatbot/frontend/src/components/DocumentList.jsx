// frontend/src/components/DocumentList.jsx

export default function DocumentList({ documents }) {
  return (
    <div className="flex-1">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Dokumente ({documents.length})
      </h2>

      {documents.length === 0 ? (
        <p className="text-sm text-gray-600 italic">Noch keine PDFs hochgeladen.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc, i) => (
            <li
              key={i}
              className="bg-dark-700/50 border border-dark-600/30 rounded-lg px-3 py-2 flex items-center gap-3 group hover:border-accent/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-300 truncate">{doc.filename}</p>
                <p className="text-xs text-gray-500">{doc.chunks_count} Chunks</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
