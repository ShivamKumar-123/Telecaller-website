import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  /* ⏳ Loading state */
  if (loading) {
    return (
      <div className="animate-fade-in relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-100 dark:bg-night-950">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-white dark:hidden" aria-hidden />
        <div className="absolute inset-0 hidden bg-mesh-brand opacity-90 dark:block" aria-hidden />
        <div className="absolute inset-0 bg-grid-subtle bg-grid opacity-15 dark:opacity-20" aria-hidden />
        <div className="relative flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-sky-500/40 border-t-sky-500 dark:border-sky-500/30 dark:border-t-sky-400" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Verifying access…</p>
        </div>
      </div>
    );
  }

  /* 🔐 Not authenticated → redirect to login */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}   // 👈 remember requested page
      />
    );
  }

  /* ✅ Authorized */
  return children;
};

export default PrivateRoute;
