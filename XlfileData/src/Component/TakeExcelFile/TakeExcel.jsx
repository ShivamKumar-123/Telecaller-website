import React, { useState } from "react";
import { getApiBase } from "../../config/api";

function TakeExcel() {
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const downloadFile = async (url, filename) => {
    const token = localStorage.getItem("access");
    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("You are not authorized to download this file");
      }

      if (!res.ok) {
        throw new Error("Download failed");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);
      setSuccess("File downloaded successfully.");
    } catch (err) {
      setError(err.message || "Failed to download file");
    } finally {
      setLoading(false);
    }
  };

  const downloadByDate = (e) => {
    e.preventDefault();

    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    const url = `${getApiBase()}/download-excel-by-date/?created_date=${selectedDate}`;
    downloadFile(url, `data_${selectedDate}.xlsx`);
  };

  const downloadAll = () => {
    const url = `${getApiBase()}/download-excel-all/`;
    downloadFile(url, "all_data.xlsx");
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
          {success}
        </p>
      )}

      <form onSubmit={downloadByDate} className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
          Select date
        </label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input-dark"
        />

        <button
          type="submit"
          disabled={!selectedDate || loading}
          className="btn-primary w-full py-3 disabled:pointer-events-none disabled:opacity-40"
        >
          {loading ? "Preparing…" : "Download by date"}
        </button>
      </form>

      <button
        type="button"
        onClick={downloadAll}
        disabled={loading}
        className="w-full rounded-xl border border-sky-500/40 bg-sky-500/15 py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/25 disabled:opacity-40"
      >
        {loading ? "Preparing…" : "Download all data (admin)"}
      </button>
    </div>
  );
}

export default TakeExcel;
