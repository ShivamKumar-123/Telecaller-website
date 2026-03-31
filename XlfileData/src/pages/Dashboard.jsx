import React, { useState, useEffect, useCallback, useId } from "react";
import { Link, NavLink } from "react-router-dom";
import AdminShell, { NeuAccordion } from "../Component/AdminNeu/AdminShell";
import { getApiBase, readApiJson } from "../config/api";
import "../styles/neu-admin.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

function formatApiError(data) {
  if (!data || typeof data !== "object") return null;
  const d = data.detail;
  if (Array.isArray(d)) {
    return d.map((x) => (typeof x === "string" ? x : x?.message || JSON.stringify(x))).join(", ");
  }
  if (typeof d === "string") return d;
  return data.error || null;
}

function normalizeDashboardPayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  const today = raw.today || {};
  const trend = Array.isArray(raw.daily_trend) ? raw.daily_trend : [];
  return {
    total_records: Number(raw.total_records) || 0,
    interested: Number(raw.interested) || 0,
    not_interested: Number(raw.not_interested) || 0,
    pending: Number(raw.pending) || 0,
    conversion_rate: Number(raw.conversion_rate) || 0,
    today: {
      total: Number(today.total) || 0,
      interested: Number(today.interested) || 0,
      not_interested: Number(today.not_interested) || 0,
    },
    daily_trend: trend.map((d) => ({
      date: d.date,
      total: Number(d.total) || 0,
      interested: Number(d.interested) || 0,
      not_interested: Number(d.not_interested) || 0,
    })),
    top_telecallers: Array.isArray(raw.top_telecallers)
      ? raw.top_telecallers.map((t) => ({
          name: t.name ?? "—",
          count: Number(t.count) || 0,
        }))
      : [],
  };
}

function BreadcrumbSep() {
  return (
    <svg className="mx-1 h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconMetrics() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="6" height="16" rx="1" />
      <rect x="14" y="4" width="6" height="10" rx="1" />
    </svg>
  );
}

function IconCharts() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21 2.18 1.09 3.03 2.58 3.03 4.42M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function IconMyLeads() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function Dashboard() {
  const chartUid = useId().replace(/:/g, "");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [myLeads, setMyLeads] = useState({
    results: [],
    count: 0,
    total_pages: 1,
    page: 1,
  });
  const [myLeadsPage, setMyLeadsPage] = useState(1);
  const [myLeadsLoading, setMyLeadsLoading] = useState(true);
  const [myLeadsError, setMyLeadsError] = useState("");
  const [myLeadsSearchInput, setMyLeadsSearchInput] = useState("");
  const [myLeadsSearchDebounced, setMyLeadsSearchDebounced] = useState("");

  const fetchStats = useCallback(async (isRefresh = false) => {
    const API = getApiBase();
    if (!API) {
      setError(
        "API reach nahi ho rahi. Django run karein; dev mein Vite /api proxy use hota hai (VITE_API_URL optional)."
      );
      setLoading(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access");
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API}/dashboard-stats/`, { headers });
      const data = await readApiJson(res);
      if (res.status === 401) {
        throw new Error("Session expired or not logged in. Please sign in again.");
      }
      if (!res.ok) {
        throw new Error(formatApiError(data) || `Server returned ${res.status}`);
      }
      const normalized = normalizeDashboardPayload(data);
      if (!normalized) throw new Error("Invalid response from server.");
      setStats(normalized);
    } catch (err) {
      const msg = err?.message || String(err);
      if (msg === "Failed to fetch" || err?.name === "TypeError") {
        setError(
          "API connect nahi ho raha. Django `python manage.py runserver` chalu karein aur .env / Vite proxy check karein."
        );
      } else {
        setError(msg);
      }
      if (!isRefresh) setStats(null);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = myLeadsSearchInput.trim();
      setMyLeadsSearchDebounced((prev) => {
        if (trimmed !== prev) setMyLeadsPage(1);
        return trimmed;
      });
    }, 350);
    return () => clearTimeout(t);
  }, [myLeadsSearchInput]);

  const fetchMyAssigned = useCallback(async () => {
    const API = getApiBase();
    if (!API) {
      setMyLeadsError("API base missing — dev server / Django check karein.");
      setMyLeadsLoading(false);
      return;
    }
    setMyLeadsLoading(true);
    setMyLeadsError("");
    try {
      const token = localStorage.getItem("access");
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const q = myLeadsSearchDebounced
        ? `&search=${encodeURIComponent(myLeadsSearchDebounced)}`
        : "";
      const res = await fetch(
        `${API}/my-assigned-records/?page=${myLeadsPage}&page_size=25${q}`,
        { headers }
      );
      const data = await readApiJson(res);
      if (res.status === 401) {
        throw new Error("Session expired or not logged in. Please sign in again.");
      }
      if (!res.ok) {
        throw new Error(formatApiError(data) || `Server returned ${res.status}`);
      }
      setMyLeads({
        results: Array.isArray(data.results) ? data.results : [],
        count: Number(data.count) || 0,
        total_pages: Math.max(Number(data.total_pages) || 1, 1),
        page: Number(data.page) || myLeadsPage,
      });
    } catch (err) {
      const msg = err?.message || String(err);
      if (msg === "Failed to fetch" || err?.name === "TypeError") {
        setMyLeadsError(
          "Assigned leads load nahi ho sake. API / login check karein."
        );
      } else {
        setMyLeadsError(msg);
      }
      setMyLeads((s) => ({ ...s, results: [], count: 0 }));
    } finally {
      setMyLeadsLoading(false);
    }
  }, [myLeadsPage, myLeadsSearchDebounced]);

  useEffect(() => {
    fetchStats(false);
  }, [fetchStats]);

  useEffect(() => {
    fetchMyAssigned();
  }, [fetchMyAssigned]);

  const breadcrumb = (
    <>
      <NavLink to="/" className="transition hover:text-indigo-300">
        Home
      </NavLink>
      <BreadcrumbSep />
      <span className="font-medium text-[var(--neu-text)]">Telecaller dashboard</span>
    </>
  );

  const headerActions = (
    <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
      <span className="hidden items-center gap-2 rounded-full neu-nm-inset px-3 py-1.5 text-xs font-medium text-emerald-300/90 sm:inline-flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Live data
      </span>
      <button
        type="button"
        disabled={refreshing}
        onClick={() => {
          fetchStats(true);
          fetchMyAssigned();
        }}
        className="neu-btn-ghost text-sm disabled:opacity-45"
      >
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>
      <Link to="/see-data" className="neu-btn-primary shrink-0 text-sm no-underline">
        See leads
      </Link>
    </div>
  );

  if (loading) {
    return (
      <AdminShell
        breadcrumb={breadcrumb}
        title="Telecaller dashboard"
        subtitle="Loading your analytics…"
        headerActions={headerActions}
      >
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
          <p className="text-sm text-[var(--neu-muted)]">Fetching backend metrics…</p>
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell
        breadcrumb={breadcrumb}
        title="Telecaller dashboard"
        subtitle="Analytics could not be loaded."
        headerActions={headerActions}
      >
        <div className="neu-nm-inset border border-rose-500/30 bg-rose-500/10 px-6 py-8 text-center text-sm text-rose-100">
          {error}
        </div>
      </AdminShell>
    );
  }

  const pieData = [
    { name: "Interested", value: stats.interested, color: "#34d399" },
    { name: "Not Interested", value: stats.not_interested, color: "#f87171" },
    { name: "Pending", value: stats.pending, color: "#94a3b8" },
  ];

  const pieSum = pieData.reduce((s, x) => s + (Number(x.value) || 0), 0);

  const COLORS = ["#34d399", "#f87171", "#94a3b8"];

  const pieLabel = ({ name, percent }) => {
    const p =
      typeof percent === "number" && Number.isFinite(percent)
        ? Math.round(percent * 100)
        : 0;
    return `${name} ${p}%`;
  };
  const gTotal = `dash-${chartUid}-total`;
  const gInterested = `dash-${chartUid}-interested`;

  const chartTooltip = {
    contentStyle: {
      backgroundColor: "#252930",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "10px",
      color: "#eceff4",
    },
  };

  const kpiTiles = [
    {
      label: "Total records",
      value: stats.total_records,
      accent: "from-sky-400 to-blue-500",
      emoji: "📋",
    },
    {
      label: "Interested",
      value: stats.interested,
      accent: "from-emerald-400 to-teal-500",
      emoji: "✅",
    },
    {
      label: "Not interested",
      value: stats.not_interested,
      accent: "from-rose-400 to-red-500",
      emoji: "❌",
    },
    {
      label: "Conversion",
      value: `${stats.conversion_rate}%`,
      accent: "from-violet-400 to-purple-500",
      emoji: "📈",
      raw: true,
    },
  ];

  const myLeadsTotalPages = Math.max(myLeads.total_pages, 1);

  return (
    <AdminShell
      breadcrumb={breadcrumb}
      title="Telecaller dashboard"
      subtitle="Real-time lead metrics and team performance — Numeric workspace."
      headerActions={headerActions}
    >
      <NeuAccordion
        title="Key metrics"
        subtitle="Totals and conversion from your database"
        icon={<IconMetrics />}
        defaultOpen
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpiTiles.map((item) => (
            <div
              key={item.label}
              className="neu-kpi-tile neu-nm-inset flex items-center justify-between gap-3 border border-white/[0.04] p-4"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--neu-muted)]">
                  {item.label}
                </p>
                <p
                  className={`mt-1 truncate text-2xl font-bold tabular-nums sm:text-3xl bg-gradient-to-br bg-clip-text text-transparent ${item.accent}`}
                >
                  {item.raw ? item.value : Number(item.value).toLocaleString()}
                </p>
              </div>
              <div className="neu-nm-raised flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl">
                {item.emoji}
              </div>
            </div>
          ))}
        </div>

        <div className="neu-nm-flat mt-5 border border-white/[0.06] p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--neu-text)]">
            <span className="text-lg">📅</span> Today&apos;s performance
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="neu-nm-inset rounded-xl p-4 text-center">
              <p className="text-xs text-[var(--neu-muted)]">Total leads</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--neu-text)]">
                {stats.today.total}
              </p>
            </div>
            <div className="neu-nm-inset rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-400/90">Interested</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-400">
                {stats.today.interested}
              </p>
            </div>
            <div className="neu-nm-inset rounded-xl p-4 text-center">
              <p className="text-xs text-rose-400/90">Not interested</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-rose-400">
                {stats.today.not_interested}
              </p>
            </div>
          </div>
        </div>
      </NeuAccordion>

      <NeuAccordion
        title="Your assigned leads"
        subtitle="Sirf aap par assign kiye gaye records — alag user ko alag list"
        icon={<IconMyLeads />}
        defaultOpen
      >
        {myLeadsError ? (
          <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {myLeadsError}
          </p>
        ) : null}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <label className="sr-only" htmlFor="dashboard-my-leads-search">
            Search assigned leads
          </label>
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neu-muted)]" aria-hidden>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              id="dashboard-my-leads-search"
              type="search"
              value={myLeadsSearchInput}
              onChange={(e) => setMyLeadsSearchInput(e.target.value)}
              placeholder="Search by name, phone, city, ID, date (YYYY-MM-DD)…"
              className="neu-input w-full rounded-xl py-2.5 pl-10 pr-10 text-sm"
              autoComplete="off"
            />
            {myLeadsSearchInput ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-[var(--neu-muted)] transition hover:bg-white/[0.06] hover:text-[var(--neu-text)]"
                onClick={() => setMyLeadsSearchInput("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : null}
          </div>
          {myLeadsSearchDebounced ? (
            <p className="shrink-0 text-xs text-[var(--neu-muted)]">
              Filter: &ldquo;{myLeadsSearchDebounced}&rdquo;
            </p>
          ) : null}
        </div>
        <div className="-mx-1 overflow-x-auto overscroll-x-contain rounded-xl border border-white/[0.06] px-1 [touch-action:pan-x] sm:mx-0 sm:px-0">
          <table className="w-full min-w-[34rem] text-left text-xs sm:min-w-[720px] sm:text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02]">
              <tr className="text-[var(--neu-muted)]">
                <th className="px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide sm:px-3 sm:py-3 sm:text-xs">
                  ID
                </th>
                <th className="px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide sm:px-3 sm:py-3 sm:text-xs">
                  Phone
                </th>
                <th className="hidden px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide sm:table-cell sm:px-3 sm:py-3 sm:text-xs">
                  Name
                </th>
                <th className="hidden px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide md:table-cell sm:px-3 sm:py-3 sm:text-xs">
                  City
                </th>
                <th className="hidden px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide lg:table-cell sm:px-3 sm:py-3 sm:text-xs">
                  Lead date
                </th>
                <th className="px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide sm:px-3 sm:py-3 sm:text-xs">
                  Interest
                </th>
                <th className="hidden px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide xl:table-cell sm:px-3 sm:py-3 sm:text-xs">
                  Assigned
                </th>
                <th className="w-20 px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide sm:w-28 sm:px-3 sm:py-3 sm:text-xs">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {myLeadsLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-[var(--neu-muted)]">
                    Loading your assigned leads…
                  </td>
                </tr>
              ) : myLeads.results.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-[var(--neu-muted)]">
                    {myLeadsSearchDebounced ? (
                      <>
                        Is search se koi lead match nahi hui. Query badlein ya{" "}
                        <button
                          type="button"
                          className="text-indigo-300 underline-offset-2 hover:underline"
                          onClick={() => setMyLeadsSearchInput("")}
                        >
                          clear
                        </button>{" "}
                        karein.
                      </>
                    ) : (
                      <>
                        Koi assigned lead nahi.{" "}
                        <Link to="/see-data" className="text-indigo-300 underline-offset-2 hover:underline">
                          See leads
                        </Link>{" "}
                        par date chun kar fetch karein.
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                myLeads.results.map((row) => (
                  <tr key={row.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-2 py-2 tabular-nums text-[var(--neu-muted)] sm:px-3 sm:py-2.5">
                      {row.id}
                    </td>
                    <td className="max-w-[7.5rem] truncate px-2 py-2 font-medium text-[var(--neu-text)] sm:max-w-none sm:px-3 sm:py-2.5">
                      {row.phone_number}
                    </td>
                    <td className="hidden px-2 py-2 text-[var(--neu-text)]/90 sm:table-cell sm:px-3 sm:py-2.5">
                      {row.full_name || "—"}
                    </td>
                    <td className="hidden px-2 py-2 text-[var(--neu-muted)] md:table-cell sm:px-3 sm:py-2.5">
                      {row.city_name || "—"}
                    </td>
                    <td className="hidden px-2 py-2 text-xs text-[var(--neu-muted)] lg:table-cell sm:px-3 sm:py-2.5">
                      {row.created_date || "—"}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2.5">
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
                    <td className="hidden px-2 py-2 text-xs text-[var(--neu-muted)] xl:table-cell sm:px-3 sm:py-2.5">
                      {row.assigned_to_username || "—"}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                      <Link
                        to={`/update-interest/${row.id}`}
                        className="inline-block rounded-lg bg-indigo-600/85 px-2 py-1 text-[10px] font-medium text-white no-underline transition hover:bg-indigo-600 sm:px-2.5 sm:text-xs"
                      >
                        Update
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-[var(--neu-muted)]">
            {myLeads.count.toLocaleString()} total · Page {myLeads.page} of {myLeadsTotalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={myLeadsPage <= 1 || myLeadsLoading}
              onClick={() => setMyLeadsPage((p) => Math.max(1, p - 1))}
              className="neu-btn-ghost text-sm disabled:opacity-35"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={myLeadsPage >= myLeadsTotalPages || myLeadsLoading}
              onClick={() => setMyLeadsPage((p) => p + 1)}
              className="neu-btn-ghost text-sm disabled:opacity-35"
            >
              Next
            </button>
          </div>
        </div>
      </NeuAccordion>

      <NeuAccordion
        title="Trends & distribution"
        subtitle="Last 7 days and interest split"
        icon={<IconCharts />}
        defaultOpen
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="neu-nm-inset border border-white/[0.05] p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--neu-text)]">Last 7 days</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.daily_trend}>
                  <defs>
                    <linearGradient id={gTotal} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id={gInterested} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    stroke="#8b939e"
                    tick={{ fill: "#8b939e", fontSize: 11 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                  />
                  <YAxis stroke="#8b939e" tick={{ fill: "#8b939e", fontSize: 11 }} />
                  <Tooltip {...chartTooltip} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#818cf8"
                    fillOpacity={1}
                    fill={`url(#${gTotal})`}
                    name="Total"
                  />
                  <Area
                    type="monotone"
                    dataKey="interested"
                    stroke="#34d399"
                    fillOpacity={1}
                    fill={`url(#${gInterested})`}
                    name="Interested"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="neu-nm-inset border border-white/[0.05] p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--neu-text)]">Interest distribution</h3>
            <div className="h-72">
              {pieSum > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={96}
                      paddingAngle={4}
                      dataKey="value"
                      label={pieLabel}
                      labelLine={{ stroke: "#8b939e" }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[var(--neu-muted)]">
                  <span className="text-3xl opacity-60">○</span>
                  No leads to chart yet (all counts are zero).
                </div>
              )}
            </div>
          </div>
        </div>
      </NeuAccordion>

      <NeuAccordion
        title="Top telecallers"
        subtitle="By records updated"
        icon={<IconTrophy />}
        defaultOpen
      >
        {stats.top_telecallers.length > 0 ? (
          <div className="neu-nm-inset h-64 border border-white/[0.05] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.top_telecallers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#8b939e" tick={{ fill: "#8b939e", fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#8b939e"
                  tick={{ fill: "#8b939e", fontSize: 11 }}
                  width={96}
                />
                <Tooltip {...chartTooltip} />
                <Bar
                  dataKey="count"
                  fill="#818cf8"
                  radius={[0, 8, 8, 0]}
                  name="Records updated"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="neu-nm-inset py-14 text-center text-[var(--neu-muted)]">
            <span className="mb-3 block text-4xl">📭</span>
            No telecaller activity yet
          </div>
        )}
      </NeuAccordion>

      {stats.pending > 0 && (
        <div className="neu-nm-flat mt-2 flex flex-col gap-4 border border-amber-500/25 bg-amber-500/[0.07] p-5 sm:flex-row sm:items-center">
          <div className="neu-nm-inset flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl">
            ⚠️
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-amber-200">
              {stats.pending.toLocaleString()} pending records
            </h3>
            <p className="mt-1 text-sm text-amber-100/70">
              Leads waiting to be contacted — open assigned data and start calling.
            </p>
          </div>
          <Link
            to="/see-data"
            className="neu-btn-primary shrink-0 text-center text-sm no-underline sm:px-6"
          >
            Start calling →
          </Link>
        </div>
      )}
    </AdminShell>
  );
}

export default Dashboard;
