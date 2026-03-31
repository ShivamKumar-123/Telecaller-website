import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import UpdateInterest from "./pages/UpdateInterest";
import Login from "./pages/Login";
import AddExcelPage from "./pages/AddExcelPage";
import DownloadExcel from "./pages/DownloadExcel";
import SeeData from "./pages/SeeData";

import PrivateRoute from "./Component/PrivateRoute";
import AdminRoute from "./Component/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-page-enter min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Navigate to="/update-interest" replace />} />

        <Route
          path="/update-interest"
          element={
            <PrivateRoute>
              <UpdateInterest />
            </PrivateRoute>
          }
        />
        <Route
          path="/update-interest/:recordId"
          element={
            <PrivateRoute>
              <UpdateInterest />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/add-excel"
          element={
            <PrivateRoute>
              <AddExcelPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/download-excel"
          element={
            <PrivateRoute>
              <DownloadExcel />
            </PrivateRoute>
          }
        />

        <Route
          path="/see-data"
          element={
            <PrivateRoute>
              <SeeData />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
