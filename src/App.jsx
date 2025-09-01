import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import Login from "./Authentication/Login";
import Bookings from "./Pages/Bookings";
import ApprovedVisas from "./Pages/ApprovedVisas";
import DeletedVisas from "./Pages/DeletedVisas";
import Countries from "./Pages/Countries";
import Search from "./Pages/Search";
import Reports from "./Pages/Reports";
import AdminDashboard from "./Pages/AdminDashboard";
import Navbar from "./Components/Navbar";
import ProtectedRoute from "./Components/ProtectedRoute";

function AppContent() {
  const { user, isAdmin, isAdminLoading } = useAuth();
  const location = useLocation();

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is logged in
  if (user) {
    // If the user is an admin
    if (isAdmin) {
      // If an admin is on a non-admin path, redirect them to the dashboard.
      // Admin paths are defined as starting with "/admin".
      if (!location.pathname.startsWith("/admin")) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return (
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Add other admin routes here, e.g., /admin/settings */}
          {/* Fallback for any non-matched /admin/* route */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      );
    }
    // If the user is a regular user
    else {
      // If a regular user is on the login page, redirect them to bookings
      if (location.pathname === "/login") {
        return <Navigate to="/bookings" replace />;
      }
      return (
        <>
          <Navbar userName={user.email} />
          <Routes>
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/approved-visas" element={<ProtectedRoute><ApprovedVisas /></ProtectedRoute>} />
            <Route path="/deleted-visas" element={<ProtectedRoute><DeletedVisas /></ProtectedRoute>} />
            <Route path="/countries" element={<ProtectedRoute><Countries /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/bookings" replace />} />
            {/* Any other route redirects to bookings for logged-in users */}
            <Route path="*" element={<Navigate to="/bookings" replace />} />
          </Routes>
        </>
      );
    }
  }

  // If user is not logged in
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Any other route redirects to login for logged-out users */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <>
      <AppContent />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
