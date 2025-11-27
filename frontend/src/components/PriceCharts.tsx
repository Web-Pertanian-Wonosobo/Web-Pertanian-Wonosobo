import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { RefreshCw, TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchAllKomoditas, type Komoditas } from "../services/komoditasApi";

interface ChartDataPoint {
  date: string;
  price: number;
  formattedDate: string;
  commodity: string;
}

interface CommodityStats {
  name: string;
  currentPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange: number;
  priceChangePercent: number;
  dataPoints: number;
}

export function PriceCharts() {
  const [allData, setAllData] = useState<Komoditas[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>("all");
  const [commodities, setCommodities] = useState<string[]>([]);
  const [stats, setStats] = useState<CommodityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // Load data from database
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllKomoditas();
      console.log("ðY“S Loaded market data:", data.length, "records");
      
      // Get unique commodities
      const uniqueCommodities = Array.from(
        new Set(data.map((item) => item.nama || "Tidak diketahui"))
      ).sort();
      
      setCommodities(uniqueCommodities);
      setAllData(data);
      
      // Set default commodity if available
      if (uniqueCommodities.length > 0 && selectedCommodity === "all") {
        setSelectedCommodity(uniqueCommodities[0]);
      }
      
      toast.success(`${data.length} data berhasil dimuat`);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  // Filter data by time range
  const filterByTimeRange = (data: Komoditas[]): Komoditas[] => {
    const now = new Date();
    let daysAgo: number;
    
    switch (timeRange) {
      case "7d":
        daysAgo = 7;
        break;
      case "30d":
        daysAgo = 30;
        break;
      case "90d":
        daysAgo = 90;
        break;
      case "1y":
        daysAgo = 365;
        break;
      default:
        daysAgo = 30;
    }
    
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return data.filter((item) => {
      if (!item.tanggal) return false;
      const itemDate = new Date(item.tanggal);
      return itemDate >= cutoffDate;
    });
  };

  // Process data for charts
  useEffect(() => {
    if (allData.length === 0 || !selectedCommodity) return;

    let filtered = allData;
    
    // Filter by commodity
    if (selectedCommodity !== "all") {
      filtered = allData.filter((item) => item.nama === selectedCommodity);
    }
    
    // Filter by time range
    filtered = filterByTimeRange(filtered);

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.tanggal || 0).getTime();
      const dateB = new Date(b.tanggal || 0).getTime();
      return dateA - dateB;
    });

    // Prepare chart data
    const prepared: ChartDataPoint[] = filtered.map((item) => {
      const date = new Date(item.tanggal || "");
      return {
        date: item.tanggal || "",
        price: item.harga || 0,
        formattedDate: date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        commodity: item.nama || "Tidak diketahui",
      };
    });

    setChartData(prepared);

    // Calculate statistics
    if (prepared.length > 0) {
      const prices = prepared.map((d) => d.price);
      const currentPrice = prices[prices.length - 1];
      const previousPrice = prices[0];
      const priceChange = currentPrice - previousPrice;
      const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

      setStats({
        name: selectedCommodity,
        currentPrice,
        avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        priceChange,
        priceChangePercent,
        dataPoints: prepared.length,
      });
    } else {
      setStats(null);
    }
  }, [allData, selectedCommodity, timeRange]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Format price to Rupiah
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{data.formattedDate}</p>
          <p className="text-sm text-gray-600">{data.commodity}</p>
          <p className="font-bold text-green-600 text-lg">
            {formatPrice(data.price)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Grafik Harga Komoditas</h1>
          <p className="text-muted-foreground">
            Visualisasi harga pasar real-time dan historis
          </p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Pilih Komoditas
              </label>
              <Select
                value={selectedCommodity}
                onValueChange={setSelectedCommodity}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih komoditas" />
                </SelectTrigger>
                <SelectContent>
                  {commodities.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Rentang Waktu
              </label>
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                  <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                  <SelectItem value="90d">90 Hari Terakhir</SelectItem>
                  <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Harga Saat Ini</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(stats.currentPrice)}
                  </p>
                </div>
                <Badge
                  variant={stats.priceChange >= 0 ? "default" : "destructive"}
                  className="h-fit"
                >
                  {stats.priceChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stats.priceChangePercent.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Harga Rata-rata</p>
              <p className="text-2xl font-bold">{formatPrice(stats.avgPrice)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Harga Tertinggi</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPrice(stats.maxPrice)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Harga Terendah</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(stats.minPrice)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Memuat data grafik...</p>
          </CardContent>
        </Card>
      ) : chartData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Tidak ada data untuk periode yang dipilih
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Coba pilih komoditas atau rentang waktu yang berbeda
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="line" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="line">
              <TrendingUp className="h-4 w-4 mr-2" />
              Line Chart
            </TabsTrigger>
            <TabsTrigger value="area">
              <BarChart3 className="h-4 w-4 mr-2" />
              Area Chart
            </TabsTrigger>
            <TabsTrigger value="bar">
              <Calendar className="h-4 w-4 mr-2" />
              Bar Chart
            </TabsTrigger>
          </TabsList>

          {/* Line Chart */}
          <TabsContent value="line">
            <Card>
              <CardHeader>
                <CardTitle>Grafik Pergerakan Harga</CardTitle>
                <CardDescription>
                  Tren harga {selectedCommodity} dalam {timeRange === "7d" ? "7 hari" : timeRange === "30d" ? "30 hari" : timeRange === "90d" ? "90 hari" : "1 tahun"} terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Harga"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Area Chart */}
          <TabsContent value="area">
            <Card>
              <CardHeader>
                <CardTitle>Grafik Area Harga</CardTitle>
                <CardDescription>
                  Visualisasi area harga {selectedCommodity} dalam {timeRange === "7d" ? "7 hari" : timeRange === "30d" ? "30 hari" : timeRange === "90d" ? "90 hari" : "1 tahun"} terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="price"
                      name="Harga"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bar Chart */}
          <TabsContent value="bar">
            <Card>
              <CardHeader>
                <CardTitle>Grafik Batang Harga</CardTitle>
                <CardDescription>
                  Perbandingan harga {selectedCommodity} dalam {timeRange === "7d" ? "7 hari" : timeRange === "30d" ? "30 hari" : timeRange === "90d" ? "90 hari" : "1 tahun"} terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="price"
                      name="Harga"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Data Info */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Informasi Data</p>
                <p className="text-xs text-muted-foreground">
                  Menampilkan {stats.dataPoints} data point untuk {selectedCommodity}
                </p>
              </div>
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {timeRange === "7d" ? "7 Hari" : timeRange === "30d" ? "30 Hari" : timeRange === "90d" ? "90 Hari" : "1 Tahun"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
