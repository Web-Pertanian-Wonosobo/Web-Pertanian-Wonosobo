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
  const [isInitializing, setIsInitializing] = useState(true);

  // Periksa localStorage saat aplikasi dimuat untuk memulihkan sesi
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem("authUser");
        const savedRole = localStorage.getItem("authRole");
        const savedToken = localStorage.getItem("authToken");
        
        console.log("🔍 Checking localStorage for existing session...");
        console.log("Saved user:", savedUser ? "found" : "not found");
        console.log("Saved role:", savedRole);
        console.log("Saved token:", savedToken ? "found" : "not found");
        
        if (savedUser && savedRole) {
          const user = JSON.parse(savedUser);
          console.log("📋 Parsing user data:", user);
          
          // Check session expiry if available
          if (user.sessionExpiry) {
            const expiryTime = new Date(user.sessionExpiry);
            const now = new Date();
            
            if (now > expiryTime) {
              console.log("⏰ Session expired, clearing localStorage");
              localStorage.removeItem("authUser");
              localStorage.removeItem("authRole");
              localStorage.removeItem("authToken");
              setIsInitializing(false);
              return;
            }
          }
          
          console.log("✅ Found valid session:", user);
          
          if (savedRole === "admin" && user.role === "admin") {
            setIsLoggedIn(true);
            setUserRole("admin");
            console.log("🔐 Admin session restored");
            
            // Jika user berada di halaman public, redirect ke admin
            if (!location.pathname.startsWith("/admin") && location.pathname !== "/") {
              console.log("🔄 Redirecting to admin dashboard");
              navigate("/admin/dashboard", { replace: true });
            }
          } else {
            // Invalid atau corrupted data
            console.warn("⚠️ Invalid session data found, clearing...");
            localStorage.removeItem("authUser");
            localStorage.removeItem("authRole");
            localStorage.removeItem("authToken");
          }
        } else {
          console.log("ℹ️ No existing session found");
        }
      } catch (error) {
        console.error("❌ Error checking auth status:", error);
        // Clear corrupted localStorage
        localStorage.removeItem("authUser");
        localStorage.removeItem("authRole");
        localStorage.removeItem("authToken");
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthStatus();
  }, []); // Only run once on mount

  // Show loading spinner while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // Determine app mode based on current path
  const isAdminRoute = location.pathname.startsWith("/admin");
  const appMode = isLoggedIn && isAdminRoute ? "admin" : "public";

  const handleLogin = (role: "admin" | "guest") => {
    console.log("🔑 Login dengan role:", role);

    if (role === "admin") {
      // Pastikan data user sudah disimpan di localStorage dari LoginRegister
      const savedUser = localStorage.getItem("authUser");
      const savedRole = localStorage.getItem("authRole");
      
      if (savedUser && savedRole === "admin") {
        setIsLoggedIn(true);
        setUserRole("admin");
        navigate("/admin/dashboard");
        console.log("✅ Admin logged in and session saved");
      } else {
        console.error("❌ No admin user data found in localStorage");
        // Fallback: tetap login tapi tanpa persistent session
        setIsLoggedIn(true);
        setUserRole("admin");
        navigate("/admin/dashboard");
      }
    } else if (role === "guest") {
      setIsLoggedIn(false);
      setUserRole(null);
      // Clear any existing admin session
      localStorage.removeItem("authUser");
      localStorage.removeItem("authRole");
      navigate("/dashboard");
      console.log("👥 User continues as guest, admin session cleared");
    }
  };

  const handleLogout = () => {
    console.log("🚪 User logging out...");
    setIsLoggedIn(false);
    setUserRole(null);
    
    // Clear all authentication data
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    localStorage.removeItem("authToken");
    
    navigate("/dashboard", { replace: true });
    console.log("✅ Logout complete, all auth data cleared");
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
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
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
