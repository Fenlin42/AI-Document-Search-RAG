// frontend/src/components/PDFUploader.jsx
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function PDFUploader({ apiUrl, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setStatus(null);
      setProgress(30);

      const formData = new FormData();
      formData.append("file", file);

      try {
        setProgress(60);
        const res = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          body: formData,
        });

        setProgress(90);

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Upload fehlgeschlagen");
        }

        const data = await res.json();
        setProgress(100);
        setStatus({
          type: "success",
          message: `${data.filename} — ${data.chunks_count} Chunks`,
        });
        onSuccess(data);
      } catch (err) {
        setStatus({ type: "error", message: err.message });
      } finally {
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      }
    },
    [apiUrl, onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Dokument hochladen
      </h2>

      <div
        {...getRootProps()}
        className={`relative rounded-xl p-5 text-center cursor-pointer transition-all duration-300 neon-border overflow-hidden
          ${isDragActive ? "border-neon bg-neon/5 shadow-neon" : "bg-dark-800/50"}
          ${uploading ? "opacity-60 cursor-not-allowed pointer-events-none" : "hover:bg-dark-700/50"}`}
      >
        <input {...getInputProps()} />

        {uploading && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-neon transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        )}

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-7 h-7 border-2 border-neon border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Verarbeite PDF...</p>
          </div>
        ) : isDragActive ? (
          <div className="py-1">
            <p className="text-neon font-medium text-sm">Hier ablegen</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-neon/5 flex items-center justify-center border border-neon/10">
              <svg className="w-5 h-5 text-neon/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">
                PDF hierher ziehen oder <span className="text-neon/80 hover:text-neon">klicken</span>
              </p>
              <p className="text-[10px] text-gray-600 mt-1">Max. 20 MB</p>
            </div>
          </div>
        )}
      </div>

      {status && (
        <div
          className={`mt-3 px-3 py-2.5 rounded-lg text-xs animate-fade-in ${
            status.type === "success"
              ? "bg-emerald-500/5 text-emerald-400 border border-emerald-500/15"
              : "bg-red-500/5 text-red-400 border border-red-500/15"
          }`}
        >
          <div className="flex items-center gap-2">
            {status.type === "success" ? (
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {status.message}
          </div>
        </div>
      )}
    </div>
  );
}
