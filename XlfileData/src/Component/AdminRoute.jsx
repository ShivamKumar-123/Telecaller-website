import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isStaff, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="animate-fade-in flex min-h-screen items-center justify-center bg-slate-100 dark:bg-night-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500/40 border-t-sky-500 dark:border-sky-500/30 dark:border-t-sky-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location }} />
    );
  }

  if (!isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
