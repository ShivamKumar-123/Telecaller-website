import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getApiBase } from "../../config/api";

function PendingInterestByDate() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [records, setRecords] = useState([]);
  const [changes, setChanges] = useState({});
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500/30 border-t-sky-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-8 text-center">
        <p className="text-amber-100">Please log in to fetch and update records.</p>
        <Link
          to="/login"
          className="btn-primary mt-4 inline-flex"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const fetchRecords = async () => {
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    const API = getApiBase();
    if (!API) {
      setError("API base URL missing.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setRecords([]);
    setChanges({});
    setRemarks({});

    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Session expired. Please login again.");

      const res = await fetch(
        `${API}/fetch-and-assign-pending/?created_date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(data.error || "Failed to fetch records");
      }

      const list = data.records || [];
      setRecords(list);
      const nextChanges = {};
      list.forEach((r) => {
        if (r.interest === "Interested" || r.interest === "Not Interested") {
          nextChanges[r.phone_number] = r.interest;
        }
      });
      setChanges(nextChanges);
      if (!list.length) {
        setSuccess("No records assigned to you for this date.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (phone, value) => {
    setChanges((prev) => ({
      ...prev,
      [phone]: value,
    }));
  };

  const handleRemark = (phone, value) => {
    setRemarks((prev) => ({
      ...prev,
      [phone]: value,
    }));
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const saveAll = async () => {
    const updates = Object.entries(changes).map(
      ([phone_number, interest]) => ({
        phone_number,
        interest,
        remark: remarks[phone_number] || "",
      })
    );

    if (!updates.length) {
      setError("No changes to save");
      return;
    }

    const API = getApiBase();
    if (!API) {
      setError("API base URL missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("access");
      if (!token) throw new Error("Session expired. Please login again.");

      const res = await fetch(`${API}/bulk-update-interest/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          created_date: selectedDate,
          updates,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(data.error || "Save failed");
      }

      const n = data.records_updated ?? 0;
      if (n === 0) {
        setError(
          "No rows were updated. Fetch records for this date first so leads are assigned to your account, then save again."
        );
        return;
      }

      setRecords((prev) =>
        prev.filter((r) => !changes[r.phone_number])
      );
      setChanges({});
      setRemarks({});
      setSuccess(`${n} record${n === 1 ? "" : "s"} updated.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input-dark max-w-xs"
        />

        <button
          type="button"
          onClick={fetchRecords}
          disabled={loading}
          className="btn-primary px-6 py-2.5 disabled:opacity-50"
        >
          {loading ? "Fetching…" : "Fetch records"}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
          {success}
        </p>
      )}

      {records.map((r) => (
        <div
          key={r.phone_number}
          className="mb-3 flex flex-col gap-4 rounded-xl border border-white/15 bg-slate-900/95 p-4 text-slate-100 shadow-lg shadow-black/20 ring-1 ring-white/10 dark:bg-night-900/90 md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0">
            <p className="font-semibold tracking-tight text-white">{r.full_name || "—"}</p>
            <p className="mt-0.5 text-sm font-medium tabular-nums text-slate-200">
              {r.phone_number}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {r.city_name || "—"}, {r.state || "—"}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[280px]">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                <input
                  type="radio"
                  name={`int-${r.phone_number}`}
                  checked={changes[r.phone_number] === "Interested"}
                  onChange={() => handleChange(r.phone_number, "Interested")}
                  className="h-4 w-4 border-white/40 bg-slate-800 text-emerald-400 accent-emerald-400"
                />
                Interested
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                <input
                  type="radio"
                  name={`int-${r.phone_number}`}
                  checked={changes[r.phone_number] === "Not Interested"}
                  onChange={() => handleChange(r.phone_number, "Not Interested")}
                  className="h-4 w-4 border-white/40 bg-slate-800 text-rose-400 accent-rose-400"
                />
                Not interested
              </label>

              <button
                type="button"
                onClick={() => handleCall(r.phone_number)}
                className="rounded-lg bg-emerald-600/90 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Call
              </button>
            </div>

            <input
              type="text"
              placeholder="Remark…"
              value={
                remarks[r.phone_number] !== undefined
                  ? remarks[r.phone_number]
                  : r.remark || ""
              }
              onChange={(e) => handleRemark(r.phone_number, e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/30"
            />
          </div>
        </div>
      ))}

      {records.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={saveAll}
            disabled={loading}
            className="btn-primary px-8 py-2.5 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PendingInterestByDate;
