import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";
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

interface AnalyticsPageProps {
  onNavigate: (page: string) => void;
}

const userGrowthData = [
  { month: "Jan", users: 85 },
  { month: "Feb", users: 95 },
  { month: "Mar", users: 110 },
  { month: "Apr", users: 125 },
  { month: "Mei", users: 138 },
  { month: "Jun", users: 156 },
];

const alertsData = [
  { month: "Jan", alerts: 12 },
  { month: "Feb", alerts: 8 },
  { month: "Mar", alerts: 15 },
  { month: "Apr", alerts: 10 },
  { month: "Mei", alerts: 18 },
  { month: "Jun", alerts: 14 },
];

const villageData = [
  { name: "Kemranjen", value: 32 },
  { name: "Somagede", value: 28 },
  { name: "Sumpiuh", value: 24 },
  { name: "Banyumas", value: 20 },
  { name: "Cilongok", value: 18 },
  { name: "Lainnya", value: 34 },
];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export function AnalyticsPage({ _onNavigate }: AnalyticsPageProps) {
  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">Analitik & Laporan</h1>
        <p className="text-muted-foreground">
          Analisis mendalam penggunaan sistem dan tren monitoring
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Akses</p>
                <p className="text-2xl font-semibold mt-1">2,845</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12.5%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alert</p>
                <p className="text-2xl font-semibold mt-1">77</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">-8.2%</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg. Response Time
                </p>
                <p className="text-2xl font-semibold mt-1">1.2s</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">-15.3%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Akurasi Prediksi
                </p>
                <p className="text-2xl font-semibold mt-1">89%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+2.1%</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pertumbuhan Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#0088FE"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peringatan per Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="alerts" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Pengguna per Desa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={villageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {villageData.map((_entry, index) => (
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
                <p className="font-semibold">1,245</p>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm">Data Lereng Diakses</p>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </div>
                <p className="font-semibold">856</p>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm">Prediksi Cuaca Dilihat</p>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </div>
                <p className="font-semibold">623</p>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm">Harga Pasar Dicek</p>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </div>
                <p className="font-semibold">421</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Download Laporan</p>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </div>
                <p className="font-semibold">34</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
