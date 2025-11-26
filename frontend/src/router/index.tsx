import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from ". ./components/Dashboard";
import { SlopeAnalysis } from "../components/SlopeAnalysis";
import { WeatherPrediction } from "../components/WeatherPrediction";
import { AdminDashboard } from "../components/AdminDashboard";
import { UserManagement } from "../components/UserManagement";
import { PriceDataManagement } from "../components/PriceDataManagement";
import { LoginRegisterWithRole } from "../components/LoginRegisterWithRole";
impo

// Wrapper biar ga error props
const DashboardPage = () => <Dashboard onNavigate={() => {}} />;
const AdminPage = () => <AdminDashboard onNavigate={() => {}} />;
const AuthPage = () => <LoginRegisterWithRole onLogin={() => {}} />;

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/slope" element={<SlopeAnalysis />} />
        <Route path="/weather" element={<WeatherPrediction />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/price-data" element={<PriceDataManagement />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}
