import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CitizenDashboard from "../pages/CitizenDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import AuditLogs from "../pages/AuditLogs";
import ComplaintDetails from "../pages/ComplaintDetails";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/citizen"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints/:complaintId"
        element={
          <ProtectedRoute allowedRoles={["CITIZEN", "ADMIN"]}>
            <ComplaintDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AuditLogs />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;