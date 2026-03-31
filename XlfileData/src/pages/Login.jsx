import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Wave from "../Component/Wave/Wave";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ok = await login(form.username, form.password);

    setLoading(false);
    ok ? navigate(from, { replace: true }) : setError("Invalid username or password");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-100 dark:bg-night-950">
      <div className="relative z-20 shrink-0">
        <Wave compact />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
        <div
          className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-pink-50 dark:hidden"
          aria-hidden
        />
        <div className="absolute inset-0 hidden bg-mesh-brand dark:block" aria-hidden />
        <div
          className="absolute inset-0 bg-grid-subtle bg-grid opacity-20 dark:opacity-30"
          aria-hidden
        />
        <div
          className="absolute -left-40 top-1/4 h-72 w-72 rounded-full bg-pink-500/20 blur-[100px]"
          aria-hidden
        />
        <div
          className="absolute -right-40 bottom-1/4 h-72 w-72 rounded-full bg-sky-500/20 blur-[100px]"
          aria-hidden
        />

        <Link
          to="/"
          className="animate-fade-in relative z-10 mb-8 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Back to home
        </Link>

        <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel animate-scale-in overflow-hidden p-0 shadow-card-dark">
          <div className="border-b border-slate-200 bg-gradient-to-r from-pink-500/10 to-sky-500/10 px-8 py-8 text-center dark:border-white/5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-sky-500 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Sign in to access staff tools</p>
          </div>

          <form onSubmit={submit} className="stagger-children space-y-5 px-8 py-8">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-user" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-500">
                Username
              </label>
              <input
                id="login-user"
                className="input-dark"
                placeholder="Enter username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="login-pass" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-500">
                Password
              </label>
              <input
                id="login-pass"
                type="password"
                className="input-dark"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600 dark:text-slate-500">
          Advance Solar — internal operations
        </p>
        </div>
      </div>

      <div className="relative z-20 mt-auto shrink-0">
        <Wave compact flip />
      </div>
    </div>
  );
}
