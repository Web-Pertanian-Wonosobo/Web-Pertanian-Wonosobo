import React from "react";
import { Dashboard } from "./Dashboard";
import { AdminDashboard } from "./AdminDashboard";
import { SlopeAnalysis } from "./SlopeAnalysis";
import { WeatherPrediction } from "./WeatherPrediction";
import { PricePrediction } from "./PricePrediction";
import { AccountPage } from "./AccountPage";
import { EditProfile } from "./EditProfile";
import { ChangePassword } from "./ChangePassword";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Shield,
  Users,
  Database,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

interface PageRouterProps {
  currentPage: string;
  userRole: "guest" | "farmer" | "admin";
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onRoleChange?: (role: "farmer" | "admin") => void;
}

export function PageRouter({
  currentPage,
  userRole,
  onNavigate,
  onLogout,
}: PageRouterProps) {
  const renderPage = () => {
    // 🔒 Jika user guest & mencoba buka halaman admin
    if (userRole === "guest" && currentPage.startsWith("admin")) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Akses Ditolak 🚫
          </h1>
          <p className="text-gray-600">
            Halaman ini hanya dapat diakses oleh admin.
          </p>
          <Button onClick={() => onNavigate("loginregister")}>
            Masuk sebagai Admin
          </Button>
        </div>
      );
    }

    switch (currentPage) {
      // 🧑‍🌾 Farmer / Guest Pages
      case "dashboard":
        return <Dashboard onNavigate={onNavigate} onLogout={onLogout} />;
      case "slope":
        return <SlopeAnalysis />;
      case "weather":
        return <WeatherPrediction />;
      case "price":
        return <PricePrediction />;
      case "account":
        return <AccountPage onLogout={onLogout} onNavigate={onNavigate} />;
      case "edit-profile":
        return <EditProfile onBack={() => onNavigate("account")} />;
      case "change-password":
        return <ChangePassword onBack={() => onNavigate("account")} />;

      // 👨‍💼 Admin Pages
      case "admin-dashboard":
        return <AdminDashboard onNavigate={onNavigate} />;
      case "user-management":
        return <AdminUserManagement onNavigate={onNavigate} />;
      case "data-management":
        return <AdminDataManagement onNavigate={onNavigate} />;
      case "analytics":
        return <AdminAnalytics onNavigate={onNavigate} />;
      case "admin-settings":
        return <AdminSettings onLogout={onLogout} onNavigate={onNavigate} />;

      // 🧭 Default
      default:
        return userRole === "admin" ? (
          <AdminDashboard onNavigate={onNavigate} />
        ) : (
          <Dashboard onNavigate={onNavigate} onLogout={onLogout} />
        );
    }
  };

  return <>{renderPage()}</>;
}

// 🧩 Admin Components
function AdminUserManagement({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">Kelola akun pengguna sistem EcoScope</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Pengguna" value="2,456" color="text-blue-600" icon={<Users className="h-5 w-5 mr-2" />} />
        <StatCard title="Admin" value="5" color="text-red-600" icon={<Shield className="h-5 w-5 mr-2" />} />
        <StatCard title="🌾 Petani" value="2,451" color="text-green-600" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Manajemen Pengguna</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Fitur manajemen pengguna lengkap sedang dalam pengembangan. Saat ini Anda dapat melihat statistik pengguna di dashboard utama.
          </p>
          <Button onClick={() => onNavigate("admin-dashboard")}>Kembali ke Dashboard Admin</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDataManagement({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manajemen Data Pertanian</h1>
        <p className="text-muted-foreground">Kelola data komoditas, harga, dan informasi pertanian</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Data Komoditas" value="15" color="text-purple-600" icon={<Database className="h-5 w-5 mr-2" />} />
        <StatCard title="💰 Data Harga" value="1,234" color="text-orange-600" />
        <StatCard title="📊 Data Prediksi" value="89%" color="text-blue-600" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Manajemen Data</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Sistem manajemen data pertanian terintegrasi dengan AI untuk prediksi harga dan cuaca.
          </p>
          <Button onClick={() => onNavigate("admin-dashboard")}>Kembali ke Dashboard Admin</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminAnalytics({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Analytics & Reporting</h1>
        <p className="text-muted-foreground">Analisis data dan laporan sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Penggunaan Harian" value="1,847" color="text-green-600" icon={<BarChart3 className="h-5 w-5 mr-2" />} />
        <StatCard title="📈 Tren Bulanan" value="+12%" color="text-blue-600" />
        <StatCard title="⚠️ Alert System" value="7" color="text-orange-600" />
        <StatCard title="🎯 Akurasi AI" value="89.5%" color="text-purple-600" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Analytics Dashboard</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Dashboard analytics lengkap sedang dalam pengembangan.
          </p>
          <Button onClick={() => onNavigate("admin-dashboard")}>Kembali ke Dashboard Admin</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminSettings({ onLogout, onNavigate }: { onLogout: () => void; onNavigate: (page: string) => void }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Pengaturan Admin</h1>
      <p className="text-muted-foreground mb-6">Konfigurasi sistem dan pengaturan administrator</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Sistem" value="⚙️ Maintenance Mode, Auto Backup, Notifikasi Email" />
        <StatCard title="Keamanan" value="2FA Aktif, Timeout 1 jam, 5 Percobaan Login" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Aksi Admin</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Database className="h-4 w-4 mr-2" /> Backup Database
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" /> Reset Cache
          </Button>
          <Button variant="destructive" className="w-full justify-start" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// 🧱 Mini Komponen Statistik
function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${color || "text-primary"}`}>{value}</div>
      </CardContent>
    </Card>
  );
}