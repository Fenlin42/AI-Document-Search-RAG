// frontend/src/components/DocumentList.jsx

export default function DocumentList({ documents }) {
  return (
    <div className="flex-1">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Dokumente ({documents.length})
      </h2>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-dark-700/50 flex items-center justify-center mb-3 border border-dark-500/20">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-xs text-gray-600">Noch keine PDFs hochgeladen</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {documents.map((doc, i) => (
            <li
              key={i}
              className="group rounded-lg px-3 py-2.5 flex items-center gap-3 neon-border bg-dark-800/30 animate-fade-in"
            >
              <div className="w-8 h-8 rounded-lg bg-neon/5 flex items-center justify-center flex-shrink-0 border border-neon/10 group-hover:border-neon/25 transition-colors">
                <svg className="w-4 h-4 text-neon/50 group-hover:text-neon/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-300 truncate group-hover:text-white transition-colors">{doc.filename}</p>
                <p className="text-[10px] text-gray-600">{doc.chunks_count} Chunks indexiert</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
