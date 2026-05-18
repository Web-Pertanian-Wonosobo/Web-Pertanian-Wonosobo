import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, Activity, Database, Users, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AnalyticsPageProps {
  onNavigate: (page: string) => void;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export function AnalyticsPage({ onNavigate: _onNavigate }: AnalyticsPageProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

  const logActivity = async (activity: string) => {
    try {
      await fetch(`${API_BASE_URL}/market/log?activity=${encodeURIComponent(activity)}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  useEffect(() => {
    const sessionKey = "logged_analytics_session_" + new Date().toISOString().split('T')[0];
    if (!sessionStorage.getItem(sessionKey)) {
      logActivity("Lihat Menu Analytics");
      sessionStorage.setItem(sessionKey, "true");
    }
    
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/market/stats?year=${selectedYear}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data);
          }
        }
      } catch (error) {
        console.error("Error fetching analytics stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    total_data: 0,
    total_users: 0,
    manual_verified: 0,
    accuracy: 0
  };

  const charts = stats?.charts || {
    price_trends: [],
    commodity_dist: [],
    user_growth: []
  };

  const activities = stats?.activities || {
    dashboard_access: 0,
    gis_access: 0,
    weather_check: 0,
    price_check: 0,
    report_download: 0
  };

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="mb-2">Analitik & Laporan {selectedYear}</h1>
          <p className="text-muted-foreground">
            Analisis mendalam tren data pertanian Wonosobo tahun {selectedYear}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <span className="text-sm font-medium text-gray-500 ml-2">Pilih Tahun:</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Data Harga</p>
                <p className="text-2xl font-semibold mt-1">{metrics.total_data.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">Record Terarsip</span>
                </div>
              </div>
              <Database className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verifikasi Manual</p>
                <p className="text-2xl font-semibold mt-1">{metrics.manual_verified.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-500">Oleh Dinas</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Pengguna
                </p>
                <p className="text-2xl font-semibold mt-1">{metrics.total_users}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-purple-500">Admin & Petugas</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Akurasi Data
                </p>
                <p className="text-2xl font-semibold mt-1">{metrics.accuracy}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">Terverifikasi</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pertumbuhan Pengguna ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.user_growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Total Pengguna"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Input Data Harga ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.price_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="Jumlah Input" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Komoditas Terbanyak</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts.commodity_dist}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) =>
                    `${name}: ${value}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {charts.commodity_dist.map((_entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Aktivitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm">Akses Dashboard</p>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </div>
                <p className="font-semibold">{activities.dashboard_access}</p>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm">Data Lereng Diakses</p>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </div>
                <p className="font-semibold">{activities.gis_access}</p>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm">Prediksi Cuaca Dilihat</p>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </div>
                <p className="font-semibold">{activities.weather_check}</p>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm">Harga Pasar Dicek</p>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </div>
                <p className="font-semibold">{activities.price_check}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Download Laporan</p>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </div>
                <p className="font-semibold">{activities.report_download}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
