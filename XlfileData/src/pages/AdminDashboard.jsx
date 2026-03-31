import React, { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import AdminShell, { NeuAccordion } from "../Component/AdminNeu/AdminShell";
import { getApiBase } from "../config/api";
import "../styles/neu-admin.css";

function authHeaders(json = true) {
  const h = { Authorization: `Bearer ${localStorage.getItem("access")}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm = {
  phone_number: "",
  full_name: "",
  email: "",
  city_name: "",
  state: "",
  current_profile: "",
  details_of_current_business_or_job: "",
  interest: "",
  remark: "",
  assigned_to: "",
  created_time: "",
  created_date: "",
};

function BreadcrumbSep() {
  return (
    <svg className="mx-1 h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [queryInput, setQueryInput] = useState("");
  const [q, setQ] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newIsStaff, setNewIsStaff] = useState(false);
  const [pwdUserId, setPwdUserId] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [userMgmtBusy, setUserMgmtBusy] = useState(false);
  const [userMgmtError, setUserMgmtError] = useState("");
  const [userMgmtSuccess, setUserMgmtSuccess] = useState("");

  const loadStats = useCallback(async () => {
    const API = getApiBase();
    if (!API) return;
    setStatsError("");
    try {
      const res = await fetch(`${API}/admin/dashboard/`, { headers: authHeaders(false) });
      if (!res.ok) {
        if (res.status === 403) setStatsError("Admin access required (Django staff user).");
        else setStatsError("Could not load dashboard metrics.");
        return;
      }
      setStats(await res.json());
    } catch {
      setStatsError("Could not load dashboard metrics.");
    }
  }, []);

  const loadUsers = useCallback(async () => {
    const API = getApiBase();
    if (!API) return;
    try {
      const res = await fetch(`${API}/admin/users/`, { headers: authHeaders(false) });
      if (res.ok) setUsers(await res.json());
    } catch {
      /* optional */
    }
  }, []);

  const loadRecords = useCallback(async () => {
    const API = getApiBase();
    if (!API) return;
    setListLoading(true);
    setListError("");
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (q.trim()) params.set("q", q.trim());
    if (interestFilter) params.set("interest", interestFilter);
    try {
      const res = await fetch(`${API}/admin/records/?${params}`, {
        headers: authHeaders(false),
      });
      if (!res.ok) {
        if (res.status === 403) setListError("Admin access required.");
        else setListError("Failed to load records.");
        setRecords([]);
        return;
      }
      const data = await res.json();
      setRecords(data.results || []);
      setCount(data.count ?? 0);
      setTotalPages(Math.max(data.total_pages ?? 1, 1));
    } catch {
      setListError("Failed to load records.");
      setRecords([]);
    } finally {
      setListLoading(false);
    }
  }, [page, q, interestFilter]);

  useEffect(() => {
    loadStats();
    loadUsers();
  }, [loadStats, loadUsers]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      phone_number: row.phone_number || "",
      full_name: row.full_name || "",
      email: row.email || "",
      city_name: row.city_name || "",
      state: row.state || "",
      current_profile: row.current_profile || "",
      details_of_current_business_or_job: row.details_of_current_business_or_job || "",
      interest: row.interest || "",
      remark: row.remark || "",
      assigned_to: row.assigned_to != null ? String(row.assigned_to) : "",
      created_time: toDatetimeLocal(row.created_time),
      created_date: row.created_date || "",
    });
    setModalOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const API = getApiBase();
    if (!API) return;
    setSaving(true);
    try {
      const payload = {
        phone_number: form.phone_number.trim(),
        full_name: form.full_name.trim() || null,
        email: form.email.trim() || null,
        city_name: form.city_name.trim() || null,
        state: form.state.trim() || null,
        current_profile: form.current_profile.trim() || null,
        details_of_current_business_or_job:
          form.details_of_current_business_or_job.trim() || null,
        interest: form.interest || null,
        remark: form.remark.trim() || null,
        assigned_to: form.assigned_to === "" ? null : Number(form.assigned_to),
      };
      if (form.created_time) {
        payload.created_time = new Date(form.created_time).toISOString();
      }

      let res;
      if (editingId) {
        const patch = { ...payload };
        if (form.created_date) patch.created_date = form.created_date;
        res = await fetch(`${API}/admin/records/${editingId}/`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify(patch),
        });
      } else {
        const createPayload = { ...payload };
        delete createPayload.created_date;
        res = await fetch(`${API}/admin/records/`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(createPayload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Save failed");
        return;
      }

      setModalOpen(false);
      loadRecords();
      loadStats();
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    const API = getApiBase();
    if (!API) return;
    try {
      const res = await fetch(`${API}/admin/records/${deleteId}/`, {
        method: "DELETE",
        headers: authHeaders(false),
      });
      if (!res.ok && res.status !== 204) {
        alert("Delete failed");
        return;
      }
      setDeleteId(null);
      loadRecords();
      loadStats();
    } catch {
      alert("Network error");
    }
  };

  const applySearch = (e) => {
    e.preventDefault();
    setQ(queryInput.trim());
    setPage(1);
  };

  const createUser = async (e) => {
    e.preventDefault();
    const API = getApiBase();
    if (!API) return;
    setUserMgmtError("");
    setUserMgmtSuccess("");
    const u = newUsername.trim();
    if (!u) {
      setUserMgmtError("Username is required.");
      return;
    }
    if (newPassword.length < 8) {
      setUserMgmtError("Password must be at least 8 characters.");
      return;
    }
    setUserMgmtBusy(true);
    try {
      const res = await fetch(`${API}/admin/users/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          username: u,
          password: newPassword,
          email: newEmail.trim(),
          is_staff: newIsStaff,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUserMgmtError(data.error || "Create failed");
        return;
      }
      setUserMgmtSuccess(`User "${data.username}" was created.`);
      setNewUsername("");
      setNewPassword("");
      setNewEmail("");
      setNewIsStaff(false);
      loadUsers();
    } catch {
      setUserMgmtError("Network error");
    } finally {
      setUserMgmtBusy(false);
    }
  };

  const changeUserPassword = async (e) => {
    e.preventDefault();
    const API = getApiBase();
    if (!API) return;
    setUserMgmtError("");
    setUserMgmtSuccess("");
    const id = Number(pwdUserId);
    if (!id) {
      setUserMgmtError("Please select a user.");
      return;
    }
    if (pwdNew.length < 8) {
      setUserMgmtError("New password must be at least 8 characters.");
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setUserMgmtError("Passwords do not match.");
      return;
    }
    setUserMgmtBusy(true);
    try {
      const res = await fetch(`${API}/admin/users/${id}/password/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ password: pwdNew }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUserMgmtError(data.error || "Update failed");
        return;
      }
      setUserMgmtSuccess(`Password updated for ${data.username || "user"}.`);
      setPwdNew("");
      setPwdConfirm("");
    } catch {
      setUserMgmtError("Network error");
    } finally {
      setUserMgmtBusy(false);
    }
  };

  const kpi = stats
    ? [
        { label: "Total records", value: stats.total_records, accent: "from-sky-400 to-blue-500" },
        { label: "Interested", value: stats.interested, accent: "from-emerald-400 to-teal-500" },
        { label: "Not interested", value: stats.not_interested, accent: "from-rose-400 to-red-500" },
        { label: "Pending", value: stats.pending, accent: "from-amber-400 to-orange-500" },
        { label: "Assigned now", value: stats.assigned_now, accent: "from-violet-400 to-purple-500" },
        { label: "New today", value: stats.today_new_records, accent: "from-cyan-400 to-sky-500" },
        { label: "Staff users", value: stats.active_staff_users, accent: "from-fuchsia-400 to-pink-500" },
        { label: "Active users", value: stats.total_users, accent: "from-slate-400 to-slate-600" },
      ]
    : [];

  const breadcrumb = (
    <>
      <NavLink to="/" className="transition hover:text-indigo-300">
        Home
      </NavLink>
      <BreadcrumbSep />
      <NavLink to="/dashboard" className="transition hover:text-indigo-300">
        Dashboard
      </NavLink>
      <BreadcrumbSep />
      <span className="font-medium text-[var(--neu-text)]">Lead admin</span>
    </>
  );

  return (
    <AdminShell
      breadcrumb={breadcrumb}
      title="Lead operations"
      subtitle="Numeric overview and full CRUD on lead records. Staff-only access."
      headerActions={
        <button type="button" onClick={openCreate} className="neu-btn-primary text-sm">
          + New record
        </button>
      }
    >
      {statsError && (
        <div className="neu-nm-inset mb-6 border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {statsError}
        </div>
      )}

      <NeuAccordion
        id="metrics"
        title="Metrics overview"
        subtitle="Live counts from your database"
        icon={<IconChart />}
        defaultOpen
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {kpi.map((item) => (
            <div
              key={item.label}
              className="neu-kpi-tile neu-nm-inset border border-white/[0.04]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--neu-muted)]">
                {item.label}
              </p>
              <p
                className={`mt-2 bg-gradient-to-br ${item.accent} bg-clip-text text-2xl font-bold tabular-nums text-transparent sm:text-3xl`}
              >
                {Number(item.value).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        {!stats && !statsError && (
          <p className="mt-4 text-sm text-[var(--neu-muted)]">Loading metrics…</p>
        )}
      </NeuAccordion>

      <NeuAccordion
        id="user-accounts"
        title="User accounts"
        subtitle="Create logins or reset a user password (staff only)"
        icon={<IconUsers />}
        defaultOpen={false}
      >
        {userMgmtError && (
          <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {userMgmtError}
          </p>
        )}
        {userMgmtSuccess && (
          <p className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {userMgmtSuccess}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="neu-nm-inset border border-white/[0.06] p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-[var(--neu-text)]">New account</h3>
            <p className="mt-1 text-xs text-[var(--neu-muted)]">
              Leave Staff unchecked for telecallers; enable Staff for admin / lead admin access.
            </p>
            <form onSubmit={createUser} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Username *</label>
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="neu-input mt-1"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Password * (min 8)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="neu-input mt-1"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="neu-input mt-1"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--neu-text)]">
                <input
                  type="checkbox"
                  checked={newIsStaff}
                  onChange={(e) => setNewIsStaff(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-night-900 text-indigo-500"
                />
                Staff (Django admin / Lead admin access)
              </label>
              <button
                type="submit"
                disabled={userMgmtBusy}
                className="neu-btn-primary w-full text-sm disabled:opacity-50 sm:w-auto"
              >
                {userMgmtBusy ? "Saving…" : "Create user"}
              </button>
            </form>
          </div>

          <div className="neu-nm-inset border border-white/[0.06] p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-[var(--neu-text)]">Password change</h3>
            <p className="mt-1 text-xs text-[var(--neu-muted)]">
              Pick a user from the list. The new password replaces the old one immediately.
            </p>
            <form onSubmit={changeUserPassword} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-[var(--neu-muted)]">User *</label>
                <select
                  value={pwdUserId}
                  onChange={(e) => setPwdUserId(e.target.value)}
                  className="neu-input mt-1 cursor-pointer"
                >
                  <option value="">— Select —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                      {u.is_staff ? " (staff)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--neu-muted)]">New password *</label>
                <input
                  type="password"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  className="neu-input mt-1"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Confirm password *</label>
                <input
                  type="password"
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  className="neu-input mt-1"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={userMgmtBusy}
                className="neu-btn-primary w-full text-sm disabled:opacity-50 sm:w-auto"
              >
                {userMgmtBusy ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>
        </div>

        {users.length > 0 && (
          <div className="neu-nm-inset mt-5 overflow-x-auto border border-white/[0.05]">
            <table className="min-w-[320px] w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-white/[0.06] text-[var(--neu-muted)]">
                <tr>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide">User</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide">Email</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-3 py-2 font-medium text-[var(--neu-text)]">{u.username}</td>
                    <td className="px-3 py-2 text-[var(--neu-muted)]">{u.email || "—"}</td>
                    <td className="px-3 py-2 text-[var(--neu-muted)]">
                      {u.is_staff ? "Staff" : "Telecaller"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NeuAccordion>

      <NeuAccordion
        id="lead-records"
        title="Lead records"
        subtitle="Search, filter, edit, and delete records"
        icon={<IconDatabase />}
        defaultOpen
      >
        <form
          onSubmit={applySearch}
          className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-[var(--neu-muted)]">Search</label>
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Phone, name, email, city…"
              className="neu-input"
            />
          </div>
          <div className="w-full sm:w-44">
            <label className="mb-1 block text-xs font-medium text-[var(--neu-muted)]">Interest</label>
            <select
              value={interestFilter}
              onChange={(e) => {
                setInterestFilter(e.target.value);
                setPage(1);
              }}
              className="neu-input cursor-pointer"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not interested</option>
            </select>
          </div>
          <button type="submit" className="neu-btn-primary w-full sm:w-auto">
            Search
          </button>
        </form>

        {listError && <p className="mb-4 text-sm text-rose-300">{listError}</p>}

        <div className="neu-nm-inset overflow-x-auto rounded-xl border border-white/[0.05]">
          <table className="min-w-full divide-y divide-white/[0.06] text-left text-sm">
            <thead>
              <tr className="text-[var(--neu-muted)]">
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide">ID</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide">Phone</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide">Name</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide">City</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide">Interest</th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide">Assigned</th>
                <th className="w-36 px-3 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {listLoading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-[var(--neu-muted)]">
                    Loading…
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-[var(--neu-muted)]">
                    No records match your filters.
                  </td>
                </tr>
              ) : (
                records.map((row) => (
                  <tr key={row.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5 tabular-nums text-[var(--neu-muted)]">{row.id}</td>
                    <td className="px-3 py-2.5 font-medium text-[var(--neu-text)]">{row.phone_number}</td>
                    <td className="px-3 py-2.5 text-[var(--neu-text)]/90">{row.full_name || "—"}</td>
                    <td className="px-3 py-2.5 text-[var(--neu-muted)]">{row.city_name || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={
                          row.interest === "Interested"
                            ? "text-emerald-400"
                            : row.interest === "Not Interested"
                              ? "text-rose-400"
                              : "text-amber-300/90"
                        }
                      >
                        {row.interest || "Pending"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--neu-muted)]">
                      {row.assigned_to_username || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded-lg bg-indigo-600/85 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-indigo-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(row.id)}
                          className="rounded-lg bg-rose-600/80 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-[var(--neu-muted)]">
            {count.toLocaleString()} total · Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="neu-btn-ghost text-sm disabled:opacity-35"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="neu-btn-ghost text-sm disabled:opacity-35"
            >
              Next
            </button>
          </div>
        </div>
      </NeuAccordion>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            className="neu-nm-flat max-h-[90vh] w-full max-w-lg overflow-y-auto border border-white/[0.08] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-lg font-bold text-[var(--neu-text)]">
              {editingId ? `Edit record #${editingId}` : "Create record"}
            </h2>
            <form onSubmit={submitForm} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Phone *</label>
                <input
                  required
                  value={form.phone_number}
                  onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                  className="neu-input mt-1"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-[var(--neu-muted)]">Full name</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="neu-input mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--neu-muted)]">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="neu-input mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-[var(--neu-muted)]">City</label>
                  <input
                    value={form.city_name}
                    onChange={(e) => setForm((f) => ({ ...f, city_name: e.target.value }))}
                    className="neu-input mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--neu-muted)]">State</label>
                  <input
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className="neu-input mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Current profile</label>
                <input
                  value={form.current_profile}
                  onChange={(e) => setForm((f) => ({ ...f, current_profile: e.target.value }))}
                  className="neu-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Business / job details</label>
                <textarea
                  rows={2}
                  value={form.details_of_current_business_or_job}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, details_of_current_business_or_job: e.target.value }))
                  }
                  className="neu-input mt-1 min-h-[4rem] resize-y"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Interest</label>
                <select
                  value={form.interest}
                  onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
                  className="neu-input mt-1 cursor-pointer"
                >
                  <option value="">Pending</option>
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not interested</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Remark</label>
                <textarea
                  rows={2}
                  value={form.remark}
                  onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                  className="neu-input mt-1 min-h-[4rem] resize-y"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--neu-muted)]">Assign to user</label>
                <select
                  value={form.assigned_to}
                  onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
                  className="neu-input mt-1 cursor-pointer"
                >
                  <option value="">— Unassigned —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
              {editingId && (
                <>
                  <div>
                    <label className="text-xs text-[var(--neu-muted)]">Created date (admin)</label>
                    <input
                      type="date"
                      value={form.created_date}
                      onChange={(e) => setForm((f) => ({ ...f, created_date: e.target.value }))}
                      className="neu-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--neu-muted)]">Created time (from file)</label>
                    <input
                      type="datetime-local"
                      value={form.created_time}
                      onChange={(e) => setForm((f) => ({ ...f, created_time: e.target.value }))}
                      className="neu-input mt-1"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="neu-btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="neu-btn-primary disabled:opacity-50">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="neu-nm-flat w-full max-w-sm border border-white/[0.08] p-6 shadow-xl">
            <p className="font-medium text-[var(--neu-text)]">Delete this record?</p>
            <p className="mt-2 text-sm text-[var(--neu-muted)]">This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteId(null)} className="neu-btn-ghost">
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default AdminDashboard;
