import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Users,
  Database,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchAllKomoditas, type Komoditas } from "../services/komoditasApi";
import { AnalyticsPage } from "./AnalyticsPage";

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

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({
  onNavigate: _onNavigate,
}: AdminDashboardProps) {
  const [searchUser, setSearchUser] = useState("");
  const [searchData, setSearchData] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [komoditasData, setKomoditasData] = useState<Komoditas[]>([]);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  // Debug: Log setiap kali komoditasData berubah
  useEffect(() => {
    console.log(
      " [AdminDashboard] komoditasData state updated:",
      komoditasData
    );
    console.log(" [AdminDashboard] Length:", komoditasData.length);
  }, [komoditasData]);

  const hasLogged = useRef(false);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch komoditas
        const komoditas = await fetchAllKomoditas();
        console.log(" [AdminDashboard] Komoditas yang diterima:", komoditas);
        console.log(" [AdminDashboard] Total items:", komoditas.length);
        setKomoditasData(komoditas);

        // Fetch weather data
        const weatherResponse = await fetch(`${API_BASE_URL}/weather/current`);
        if (weatherResponse.ok) {
          const weatherJson = await weatherResponse.json();
          setWeatherData(weatherJson.data || []);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Log akses dashboard HANYA SEKALI per sesi browser
    const sessionKey = "logged_dashboard_session_" + new Date().toISOString().split('T')[0];
    if (!sessionStorage.getItem(sessionKey)) {
      logActivity("Sesi Dashboard Utama");
      sessionStorage.setItem(sessionKey, "true");
    }
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const recentAlerts = [
    {
      id: 1,
      type: "slope",
      location: "Desa Sembungan",
      severity: "high",
      time: "2 jam lalu",
    },
    {
      id: 2,
      type: "weather",
      location: "Kec. Kejajar",
      severity: "medium",
      time: "4 jam lalu",
    },
    {
      id: 3,
      type: "price",
      location: "Pasar Wonosobo",
      severity: "low",
      time: "6 jam lalu",
    },
  ];

  // Data users - sementara dummy karena belum ada endpoint user management di backend
  // TODO: Ganti dengan data dari backend ketika endpoint user sudah tersedia
  const users = [
    {
      id: 1,
      name: "Admin Wonosobo",
      email: "admin@wonosobo.go.id",
      role: "admin",
      location: "Wonosobo",
      status: "active",
      joinDate: "01 Jan 2025",
      lastLogin: new Date().toLocaleDateString("id-ID"),
    },
  ];

  // Dashboard stats dari data real
  const dashboardStats = {
    totalUsers: users.length,
    activeFarmers: 0, // Belum ada data petani dari backend
    dataPoints: komoditasData.length + weatherData.length,
    alertsToday: recentAlerts.length,
  };

  // Agricultural data sudah dari komoditas real, tidak perlu convert lagi
  // Langsung gunakan komoditasData yang sudah ada
  const agriculturalData = komoditasData.map((item, index) => ({
    id: item.id || index + 1,
    commodity: item.nama || "Tidak diketahui",
    currentPrice: item.harga || 0,
    trend: "stable",
    region: "Wonosobo",
    supply: item.harga && item.harga > 0 ? "Normal" : "Belum ada data",
    lastUpdate: item.tanggal
      ? new Date(item.tanggal).toLocaleDateString("id-ID")
      : "-",
    source: (item as any).source || "Otomatis"
  }));

  const monthlyDataChart = [
    {
      month: "Jan",
      users: 1200,
      alerts: 45,
      dataPoints:
        komoditasData.length > 0
          ? Math.floor(komoditasData.length * 0.5)
          : 8500,
    },
    {
      month: "Feb",
      users: 1350,
      alerts: 38,
      dataPoints:
        komoditasData.length > 0
          ? Math.floor(komoditasData.length * 0.6)
          : 9200,
    },
    {
      month: "Mar",
      users: 1480,
      alerts: 52,
      dataPoints:
        komoditasData.length > 0
          ? Math.floor(komoditasData.length * 0.7)
          : 10100,
    },
    {
      month: "Apr",
      users: 1650,
      alerts: 41,
      dataPoints:
        komoditasData.length > 0
          ? Math.floor(komoditasData.length * 0.8)
          : 11300,
    },
    {
      month: "Mei",
      users: 1820,
      alerts: 35,
      dataPoints:
        komoditasData.length > 0
          ? Math.floor(komoditasData.length * 0.9)
          : 12800,
    },
    {
      month: "Jun",
      users: 2100,
      alerts: 48,
      dataPoints:
        komoditasData.length > 0
          ? Math.floor(komoditasData.length * 0.95)
          : 14200,
    },
    {
      month: "Jul",
      users: users.length,
      alerts: recentAlerts.length,
      dataPoints: komoditasData.length + weatherData.length,
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredData = agriculturalData.filter((data) => {
    const matchesSearch = 
      data.commodity.toLowerCase().includes(searchData.toLowerCase()) ||
      data.region.toLowerCase().includes(searchData.toLowerCase());
    
    // Parse date for filtering (Format DD/MM/YYYY)
    const dateParts = data.lastUpdate.split('/');
    if (dateParts.length < 3) return matchesSearch;
    
    const month = dateParts[1]; // MM
    const year = dateParts[2];  // YYYY
    
    const matchesMonth = filterMonth === "all" || month.padStart(2, '0') === filterMonth;
    const matchesYear = filterYear === "all" || year === filterYear;
    
    return matchesSearch && matchesMonth && matchesYear;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "farmer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "";
      case "down":
        return "";
      case "stable":
        return "";
      default:
        return "";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleExport = () => {
    logActivity("Download CSV Rekapitulasi");
    if (agriculturalData.length === 0) return;
    const headers = ['Komoditas', 'Harga', 'Tren', 'Daerah', 'Supply', 'Update Terakhir', 'Sumber'];
    const csvRows = agriculturalData.map(d => [
      d.commodity,
      d.currentPrice,
      d.trend,
      d.region,
      d.supply,
      d.lastUpdate,
      d.source
    ]);
    const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_pertanian_wonosobo_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard Administrator</h1>
        <p className="text-muted-foreground">Kelola sistem EcoScope Wonosobo</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengguna</p>
                <h3 className="text-2xl font-bold">
                  {dashboardStats.totalUsers.toLocaleString()}
                </h3>
                <p className="text-xs text-green-600">+12% dari bulan lalu</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Petani Aktif</p>
                <h3 className="text-2xl font-bold">
                  {dashboardStats.activeFarmers.toLocaleString()}
                </h3>
                <p className="text-xs text-green-600">+8% dari bulan lalu</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <h3 className="text-2xl font-bold">
                  {dashboardStats.dataPoints.toLocaleString()}
                </h3>
                <p className="text-xs text-blue-600">+15% dari bulan lalu</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alert Hari Ini</p>
                <h3 className="text-2xl font-bold">
                  {dashboardStats.alertsToday}
                </h3>
                <p className="text-xs text-orange-600">-3 dari kemarin</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Alert Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <Alert
                key={alert.id}
                className={getSeverityColor(alert.severity)}
              >
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <strong>
                      {alert.type === "slope"
                        ? "Risiko Longsor"
                        : alert.type === "weather"
                        ? "Cuaca Ekstrem"
                        : "Fluktuasi Harga"}
                    </strong>
                    <span className="ml-2">di {alert.location}</span>
                  </div>
                  <span className="text-xs opacity-75">{alert.time}</span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tren Bulanan Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyDataChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                name="Pengguna"
              />
              <Line
                type="monotone"
                dataKey="alerts"
                stroke="#f59e0b"
                name="Alert"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6" onValueChange={(value) => {
        if (value === "analytics") logActivity("Lihat Analytics");
      }}>
        <TabsList>
          <TabsTrigger value="users">Kelola Pengguna</TabsTrigger>
          <TabsTrigger value="data">Data Pertanian</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manajemen Pengguna</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pengguna
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama atau email..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Role</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="farmer">Petani</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="font-bold text-gray-900">Nama</TableHead>
                      <TableHead className="font-bold text-gray-900">Email</TableHead>
                      <TableHead className="font-bold text-gray-900">Role</TableHead>
                      <TableHead className="font-bold text-gray-900">Lokasi</TableHead>
                      <TableHead className="font-bold text-gray-900">Status</TableHead>
                      <TableHead className="font-bold text-gray-900">Bergabung</TableHead>
                      <TableHead className="font-bold text-gray-900">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role === "admin" ? "Admin" : "Petani"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.location}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status === "active" ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Rekapitulasi Data Pertanian</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel (CSV)
                  </Button>
                  <Button onClick={() => _onNavigate('price-management')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Data
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Period Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari komoditas atau daerah..."
                    value={searchData}
                    onChange={(e) => setSearchData(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Semua Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bulan</SelectItem>
                      <SelectItem value="01">Januari</SelectItem>
                      <SelectItem value="02">Februari</SelectItem>
                      <SelectItem value="03">Maret</SelectItem>
                      <SelectItem value="04">April</SelectItem>
                      <SelectItem value="05">Mei</SelectItem>
                      <SelectItem value="06">Juni</SelectItem>
                      <SelectItem value="07">Juli</SelectItem>
                      <SelectItem value="08">Agustus</SelectItem>
                      <SelectItem value="09">September</SelectItem>
                      <SelectItem value="10">Oktober</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">Desember</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Data Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="font-bold text-gray-900">Komoditas</TableHead>
                      <TableHead className="font-bold text-gray-900">Harga Saat Ini</TableHead>
                      <TableHead className="font-bold text-gray-900">Tren</TableHead>
                      <TableHead className="font-bold text-gray-900">Daerah</TableHead>
                      <TableHead className="font-bold text-gray-900">Supply</TableHead>
                      <TableHead className="font-bold text-gray-900">Update Terakhir</TableHead>
                      <TableHead className="font-bold text-gray-900">Sumber</TableHead>
                      <TableHead className="font-bold text-gray-900">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell className="font-medium">
                          {data.commodity}
                        </TableCell>
                        <TableCell>
                          {data.currentPrice > 0 ? (
                            `Rp ${data.currentPrice.toLocaleString()}`
                          ) : (
                            <span className="text-gray-400">
                              Belum ada data
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="flex items-center">
                          <span className="mr-2">
                            {getTrendIcon(data.trend)}
                          </span>
                          {data.trend === "up"
                            ? "Naik"
                            : data.trend === "down"
                            ? "Turun"
                            : "Stabil"}
                        </TableCell>
                        <TableCell>{data.region}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              data.supply === "Normal"
                                ? "default"
                                : data.supply === "Tinggi"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {data.supply}
                          </Badge>
                        </TableCell>
                        <TableCell>{data.lastUpdate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={data.source === "Manual" ? "outline" : "secondary"}
                            className={data.source === "Manual" ? "border-blue-500 text-blue-700 bg-blue-50" : "bg-gray-100 text-gray-600"}
                          >
                            {data.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsPage onNavigate={_onNavigate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
