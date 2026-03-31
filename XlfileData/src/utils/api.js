import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

function PendingInterestByDate() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [records, setRecords] = useState([]);
  const [changes, setChanges] = useState({});
  const [loading, setLoading] = useState(false);

  /* 🔒 AUTH GUARD */
  if (authLoading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Checking authentication…
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <p className="text-center mt-10 text-red-600 font-medium">
        Please login to access this page
      </p>
    );
  }

  /* 🔹 FETCH + ASSIGN RECORDS */
  const fetchRecords = async () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    setLoading(true);
    setRecords([]);
    setChanges({});

    try {
      const res = await fetch(
        `${API}/fetch-and-assign-pending/?created_date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch records");
      }

      const data = await res.json();
      setRecords(data.records || []);
    } catch (err) {
      alert("❌ Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 HANDLE RADIO CHANGE */
  const handleChange = (phone, value) => {
    setChanges((prev) => ({
      ...prev,
      [phone]: value,
    }));
  };

  /* 🔹 SAVE ALL CHANGES */
  const saveAll = async () => {
    const updates = Object.entries(changes).map(
      ([phone_number, interest]) => ({
        phone_number,
        interest,
      })
    );

    if (!updates.length) {
      alert("No changes to save");
      return;
    }

    try {
      const res = await fetch(`${API}/bulk-update-interest/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          created_date: selectedDate,
          updates,
        }),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      // Remove saved records from UI
      setRecords((prev) =>
        prev.filter((r) => !changes[r.phone_number])
      );
      setChanges({});
      alert("✅ Changes saved successfully");
    } catch {
      alert("❌ Error saving changes");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-auto"
        />

        <button
          onClick={fetchRecords}
          disabled={loading}
          className="bg-gray-900 text-white px-5 py-2 rounded hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? "Fetching..." : "Fetch Records"}
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-500 text-center">Loading records…</p>
      )}

      {/* EMPTY STATE */}
      {!loading && records.length === 0 && selectedDate && (
        <p className="text-center text-gray-500">
          No pending records for this date
        </p>
      )}

      {/* RECORD LIST */}
      {records.map((r) => (
        <div
          key={r.phone_number}
          className="border p-4 mb-3 rounded flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <p className="font-medium text-gray-800">
              {r.full_name || "—"}
            </p>
            <p className="text-sm text-gray-500">{r.phone_number}</p>
            <p className="text-xs text-gray-400">
              {r.city_name || "-"}, {r.state || "-"}
            </p>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={r.phone_number}
                checked={changes[r.phone_number] === "Interested"}
                onChange={() =>
                  handleChange(r.phone_number, "Interested")
                }
                className="accent-green-600"
              />
              Interested
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={r.phone_number}
                checked={changes[r.phone_number] === "Not Interested"}
                onChange={() =>
                  handleChange(r.phone_number, "Not Interested")
                }
                className="accent-red-600"
              />
              Not Interested
            </label>
          </div>
        </div>
      ))}

      {/* SAVE BUTTON */}
      {records.length > 0 && (
        <div className="mt-6 text-right">
          <button
            onClick={saveAll}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

export default PendingInterestByDate;
