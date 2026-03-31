import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiBase, readApiJson } from "../../config/api";

const emptyForm = {
  recordId: null,
  name: "",
  phoneNumber: "",
  interest: "",
  selectedDate: "",
  remark: "",
};

function interestFromApi(val) {
  if (val === "Interested") return "interested";
  if (val === "Not Interested") return "notinterested";
  return "";
}

function Form() {
  const { recordId: recordIdParam } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [fetchingRecord, setFetchingRecord] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRecord = useCallback(async (id) => {
    const API = getApiBase();
    const token = localStorage.getItem("access");
    if (!API || !token) {
      setLoadError("Login required to load this lead.");
      return;
    }
    setFetchingRecord(true);
    setLoadError("");
    try {
      const res = await fetch(`${API}/assigned-record/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiJson(res);
      if (!res.ok) {
        throw new Error(data.error || `Could not load record (${res.status})`);
      }
      const ymd = data.created_date ? String(data.created_date).slice(0, 10) : "";
      setFormData({
        recordId: id,
        name: data.full_name || "",
        phoneNumber: data.phone_number || "",
        interest: interestFromApi(data.interest),
        selectedDate: ymd,
        remark: data.remark || "",
      });
    } catch (err) {
      setLoadError(err.message || "Failed to load lead");
      setFormData(emptyForm);
    } finally {
      setFetchingRecord(false);
    }
  }, []);

  useEffect(() => {
    if (!recordIdParam) {
      setFormData(emptyForm);
      setLoadError("");
      return;
    }
    const id = parseInt(recordIdParam, 10);
    if (Number.isNaN(id)) {
      setLoadError("Invalid lead link.");
      return;
    }
    loadRecord(id);
  }, [recordIdParam, loadRecord]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (value) => {
    setFormData((prev) => ({ ...prev, interest: value }));
  };

  const formatDateForBackend = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.interest) {
      setError("Please select interest");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    const interestLabel =
      formData.interest === "interested" ? "Interested" : "Not Interested";

    let payload;
    if (formData.recordId != null) {
      payload = {
        record_id: formData.recordId,
        interest: interestLabel,
        remark: formData.remark,
      };
    } else {
      if (!formData.phoneNumber || !formData.selectedDate) {
        setError("Phone number and date are required.");
        return;
      }
      payload = {
        phone_number: formData.phoneNumber,
        created_date: formatDateForBackend(formData.selectedDate),
        interest: interestLabel,
        remark: formData.remark,
      };
    }

    try {
      setLoading(true);

      const response = await fetch(`${getApiBase()}/update-interest/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await readApiJson(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(data.error || "Update failed");
      }

      setSuccess("Interest updated successfully.");
      if (formData.recordId != null) {
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setFormData({ ...emptyForm, recordId: null });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRecord) {
    return (
      <p className="rounded-xl border border-white/[0.08] bg-night-900/50 px-4 py-8 text-center text-sm text-slate-400">
        Loading lead from database…
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="btn-primary w-full py-3"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input-dark"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
          Phone number
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="input-dark"
          required
          readOnly={formData.recordId != null}
          title={formData.recordId != null ? "From assigned lead" : undefined}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
          Date
        </label>
        <input
          type="date"
          name="selectedDate"
          value={formData.selectedDate}
          onChange={handleChange}
          className="input-dark"
          required
          readOnly={formData.recordId != null}
          title={formData.recordId != null ? "Lead upload date from record" : undefined}
        />
      </div>

      <div>
        <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-slate-500">
          Interest
        </label>
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              checked={formData.interest === "interested"}
              onChange={() => handleInterestChange("interested")}
              className="h-4 w-4 border-white/20 bg-night-900 text-emerald-500 focus:ring-sky-500/30"
            />
            Interested
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              checked={formData.interest === "notinterested"}
              onChange={() => handleInterestChange("notinterested")}
              className="h-4 w-4 border-white/20 bg-night-900 text-rose-500 focus:ring-sky-500/30"
            />
            Not interested
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
          Remark
        </label>
        <textarea
          name="remark"
          value={formData.remark}
          onChange={handleChange}
          rows={4}
          placeholder="Call notes, follow-up, etc."
          className="input-dark resize-y min-h-[100px]"
        />
      </div>

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

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Updating…" : "Update"}
      </button>
    </form>
  );
}

export default Form;
