import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/", end: true },
    { name: "Dashboard", path: "/dashboard", end: true },
    ...(isStaff ? [{ name: "Admin", path: "/admin", end: true }] : []),
    { name: "Add Excel", path: "/add-excel", end: true },
    { name: "Download Excel", path: "/download-excel", end: true },
    { name: "See Data", path: "/see-data", end: true },
  ];

  const linkClass = ({ isActive }) =>
    [
      "relative text-sm font-medium transition-colors",
      isActive
        ? "text-slate-900 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-pink-500 after:to-sky-500 dark:text-white dark:after:from-pink-400 dark:after:to-sky-400"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
    ].join(" ");

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 shadow-md shadow-slate-200/40 backdrop-blur-xl dark:border-white/5 dark:bg-night-900/80 dark:shadow-lg dark:shadow-black/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent dark:via-pink-500/40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.03]"
            onClick={() => setIsOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-sky-500 shadow-glow-sky transition-transform duration-500 group-hover:rotate-12 group-hover:shadow-lg">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-pink-300 to-sky-300 bg-clip-text text-transparent">
                Advance
              </span>{" "}
              <span className="text-slate-800 dark:text-white">Solar</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition-transform duration-200 hover:scale-105 ${linkClass({ isActive })}`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <div className="ml-4 flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-white/10">
              <ThemeToggle />
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                >
                  Logout
                </button>
              ) : (
                <NavLink to="/login" className="btn-primary !py-2 !text-sm">
                  Login
                </NavLink>
              )}
            </div>
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="animate-slide-down border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl dark:border-white/5 dark:bg-night-900/95 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-sm font-medium ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme</span>
              <ThemeToggle className="!h-9 !w-9" />
            </div>
            <hr className="my-2 border-slate-200 dark:border-white/10" />
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-red-500/15 py-3 text-center text-sm font-semibold text-red-300"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className="btn-primary py-3 text-center"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
