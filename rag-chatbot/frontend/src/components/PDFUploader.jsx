// frontend/src/components/PDFUploader.jsx
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function PDFUploader({ apiUrl, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setStatus(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Upload fehlgeschlagen");
        }

        const data = await res.json();
        setStatus({
          type: "success",
          message: `${data.filename} – ${data.chunks_count} Chunks erstellt`,
        });
        onSuccess(data);
      } catch (err) {
        setStatus({ type: "error", message: err.message });
      } finally {
        setUploading(false);
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
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        PDF Upload
      </h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300
          ${
            isDragActive
              ? "border-accent bg-accent/10"
              : "border-dark-600 hover:border-accent/50 hover:bg-dark-700/50"
          }
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Wird verarbeitet...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-accent font-medium">PDF hier ablegen</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16V4m0 0L8 8m4-4l4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
              />
            </svg>
            <p className="text-sm text-gray-400">
              PDF hierher ziehen oder <span className="text-accent">klicken</span>
            </p>
          </div>
        )}
      </div>

      {status && (
        <div
          className={`mt-3 px-3 py-2 rounded-lg text-sm ${
            status.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
