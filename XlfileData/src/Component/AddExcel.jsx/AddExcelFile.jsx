import React, { useState } from "react";
import { getApiBase, readApiJson } from "../../config/api";

export default function AddExcelFile() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (
      !selected.name.endsWith(".xlsx") &&
      !selected.name.endsWith(".xls")
    ) {
      setError("Please upload a valid Excel file (.xls or .xlsx)");
      setFile(null);
      return;
    }

    setError("");
    setFile(selected);
  };

  const upload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select an Excel file");
      return;
    }

    const API = getApiBase();
    if (!API) {
      setError("API base URL missing. Set VITE_API_URL in .env or run the dev server (uses /api proxy).");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      setError("Please log in before uploading.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/upload-excel/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await readApiJson(res);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(
          data.error || data.detail || (typeof data === "string" ? data : "Upload failed")
        );
      }

      setMessage(`${data.message} (${data.rows_inserted} rows)`);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={upload} className="mx-auto max-w-md space-y-5">
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={handleFileChange}
        className="block w-full cursor-pointer text-sm text-slate-400 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-pink-500 file:to-sky-500 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:opacity-95"
      />

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Uploading…" : "Upload file"}
      </button>

      {message && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
          {message}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
