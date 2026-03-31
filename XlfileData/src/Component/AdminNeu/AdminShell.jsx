import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

const iconClass = "h-5 w-5 shrink-0 opacity-90";

function IconDashboard() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function IconTable() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function SideLink({ to, end, icon, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `neu-side-link flex items-center gap-3 px-4 py-3 text-sm font-medium ${isActive ? "neu-side-link-active" : ""}`
      }
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );
}

/**
 * Neumorphic admin layout: fixed sidebar + main column with sticky header.
 */
export default function AdminShell({
  breadcrumb,
  title,
  subtitle,
  headerActions,
  children,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);

  const doLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="neu-admin-root flex min-h-screen">
      {/* Mobile overlay */}
      {mobileNav && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/55 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/90 bg-[#eef1f7] px-4 py-6 transition-transform duration-300 dark:border-white/[0.06] dark:bg-[#262a32] lg:static lg:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="neu-nm-flat mb-8 flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
                fill="url(#logoGrad)"
              />
              <defs>
                <linearGradient id="logoGrad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a5b4fc" />
                  <stop offset="1" stopColor="#c4b5fd" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-[var(--neu-text)]">Numeric</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--neu-muted)]">
              Admin
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          <p className="mb-2 mt-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--neu-muted)]">
            Overview
          </p>
          <SideLink to="/dashboard" icon={<IconDashboard />}>
            Dashboard
          </SideLink>
          <SideLink to="/admin" end icon={<IconGrid />}>
            Lead admin
          </SideLink>

          <p className="mb-2 mt-6 px-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--neu-muted)]">
            Operations
          </p>
          <SideLink to="/add-excel" icon={<IconUpload />}>
            Upload Excel
          </SideLink>
          <SideLink to="/download-excel" icon={<IconDownload />}>
            Download Excel
          </SideLink>
          <SideLink to="/see-data" icon={<IconTable />}>
            See data
          </SideLink>
          <SideLink to="/update-interest" icon={<IconPhone />}>
            Customer interest
          </SideLink>
          <SideLink to="/" end icon={<IconHome />}>
            Marketing home
          </SideLink>
        </nav>

        <div className="mt-4 flex flex-col gap-1 border-t border-slate-200/90 pt-4 dark:border-white/[0.06]">
          <div className="neu-side-link flex cursor-default items-center gap-3 px-4 py-2 text-xs text-[var(--neu-muted)]">
            <IconSettings />
            <span className="truncate font-medium text-[var(--neu-text)]">{user || "Staff"}</span>
          </div>
          <button
            type="button"
            onClick={doLogout}
            className="neu-side-link flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-rose-300/90 hover:text-rose-200"
          >
            <IconLogout />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="neu-nm-raised sticky top-0 z-20 mx-2 mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:mx-4 sm:mt-4 sm:gap-3 sm:px-4 lg:mx-6 lg:px-5">
          <div className="flex min-w-0 flex-1 basis-[min(100%,16rem)] items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="neu-nm-press neu-btn-ghost rounded-lg p-2 lg:hidden"
              onClick={() => setMobileNav((v) => !v)}
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <nav className="flex min-w-0 flex-wrap items-center gap-1 text-xs sm:text-sm text-[var(--neu-muted)]">
              {breadcrumb}
            </nav>
          </div>
          <div className="flex max-w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            <ThemeToggle className="!h-9 !w-9" />
            {headerActions}
            <div className="neu-nm-inset hidden h-10 w-10 shrink-0 overflow-hidden rounded-full sm:block">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/40 to-violet-600/40 text-sm font-bold text-indigo-100">
                {(user || "?").slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden px-3 py-5 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl min-w-0">
            {(title || subtitle) && (
              <div className="mb-8">
                {title && (
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--neu-text)] sm:text-3xl">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--neu-muted)]">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NeuAccordion({ id, title, subtitle, icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="neu-accordion-card neu-nm-flat mb-5" id={id}>
      <button
        type="button"
        className="neu-acc-btn"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="neu-nm-inset flex h-11 w-11 shrink-0 items-center justify-center text-indigo-300">
          {icon}
        </div>
        <div className="min-w-0 flex-1 text-left pr-2">
          <h2 className="text-base font-semibold text-[var(--neu-text)] sm:text-[1.05rem]">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 break-words text-xs text-[var(--neu-muted)] sm:text-sm">{subtitle}</p>
          )}
        </div>
        <span className="neu-acc-chevron">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && <div className="neu-acc-panel">{children}</div>}
    </section>
  );
}
