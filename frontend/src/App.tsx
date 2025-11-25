import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AdminNavigation } from "./components/AdminNavigation";
import { PublicNavigation } from "./components/PublicNavigation";
import { LoginRegister } from "./components/LoginRegister";
import { Dashboard } from "./components/Dashboard";
import { WeatherPrediction } from "./components/WeatherPrediction";
import { PricePrediction } from "./components/PricePredictionNew";
import { SlopeAnalysis } from "./components/SlopeAnalysis";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserManagement } from "./components/UserManagement";
import { PriceDataManagement } from "./components/PriceDataManagement";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | null>(null);

  // No auto-redirect, let Routes handle 404

  // Determine app mode based on current path
  const isAdminRoute = location.pathname.startsWith("/admin");
  const appMode = isLoggedIn && isAdminRoute ? "admin" : "public";

  const handleLogin = (role: "admin" | "guest") => {
    console.log("🔑 Login dengan role:", role);

    if (role === "admin") {
      setIsLoggedIn(true);
      setUserRole("admin");
      navigate("/admin/dashboard");
      console.log("✅ Admin logged in");
    } else if (role === "guest") {
      setIsLoggedIn(false);
      setUserRole(null);
      navigate("/dashboard");
      console.log("👥 User continues as guest");
    }
  };

  const handleLogout = () => {
    console.log("🚪 User logging out...");
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    navigate("/dashboard");
    console.log("✅ Logout complete, localStorage cleared");
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isLoggedIn || userRole !== "admin") {
      return <LoginRegister onLogin={handleLogin} />;
    }
    return <>{children}</>;
  };

  // Tentukan komponen navigasi
  const NavigationComponent = appMode === "admin" ? AdminNavigation : PublicNavigation;
  
  // Check if current route is login page (no sidebar needed)
  const isLoginPage = location.pathname === "/loginRegister" || location.pathname === "/admin/login";

  // Login pages - no sidebar
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/loginRegister" element={<LoginRegister onLogin={handleLogin} />} />
          <Route path="/admin/login" element={<LoginRegister onLogin={handleLogin} />} />
        </Routes>
      </div>
    );
  }

  // Normal pages - with sidebar
  return (
    <div className="min-h-screen bg-background flex">
      <NavigationComponent
        currentPage={location.pathname}
        onPageChange={(path) => navigate(path)}
        isLoggedIn={isLoggedIn}
      />

      <main className="flex-1 md:ml-64">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Dashboard onNavigate={(path) => navigate(path)} />} />
          <Route path="/dashboard" element={<Dashboard onNavigate={(path) => navigate(path)} />} />
          <Route path="/prediksi-cuaca" element={<WeatherPrediction />} />
          <Route path="/prediksi-harga" element={<PricePrediction />} />
          <Route path="/analisis-lereng" element={<SlopeAnalysis />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard onNavigate={(path) => navigate(path)} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/kelola-harga" 
            element={
              <ProtectedRoute>
                <PriceDataManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/kelola-pengguna" 
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Dashboard onNavigate={(path) => navigate(path)} />} />
        </Routes>
      </main>
    </div>
  );
}
