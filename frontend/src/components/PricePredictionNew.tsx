import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Calculator,
  DollarSign,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { toast } from "sonner";
import {
  fetchAllKomoditas,
  type Komoditas,
} from "../services/komoditasApi";
import {
  forecastCommodityPrice,
  type ForecastResult,
  formatDateID,
} from "../services/forecastApi";

export function PricePrediction() {
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [komoditasData, setKomoditasData] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [forecastData, setForecastData] = useState<ForecastResult | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [historicalChartData, setHistoricalChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "180d" | "1y">("30d");
  const [simulationData, setSimulationData] = useState({
    harvestAmount: "",
    harvestDate: "",
    estimatedPrice: 0,
    totalRevenue: 0,
    bestSellDate: "",
  });

  // Load komoditas data from API
  const loadPrices = async () => {
    setLoading(true);
    try {
      const result = await fetchAllKomoditas();
      if (result && result.length > 0) {
        setKomoditasData(result);
        setLastUpdate(new Date().toLocaleString("id-ID"));
        
        // Set default commodity jika belum ada yang dipilih
        if (!selectedCommodity && result.length > 0) {
          setSelectedCommodity(result[0].nama || "");
        }
        
        toast.success(`${result.length} data komoditas berhasil dimuat`);
      } else {
        setKomoditasData([]);
        toast.info("Belum ada data komoditas");
      }
    } catch (error) {
      console.error("Error loading komoditas:", error);
      toast.error("Gagal memuat data komoditas");
      setKomoditasData([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get commodity names (unique only)
  const commodityNames = Array.from(
    new Set(komoditasData.map(k => k.nama).filter((n): n is string => Boolean(n)))
  );

  // Get current commodity data
  const getCurrentCommodityData = () => {
    if (!selectedCommodity || komoditasData.length === 0) return null;
    
    const commodity = komoditasData.find(k => k.nama === selectedCommodity);
    if (!commodity) return null;
    
    return {
      name: commodity.nama || "Tidak diketahui",
      currentPrice: commodity.harga || 0,
      unit: commodity.satuan || "kg",
      trend: "stable" as const,
      change: commodity.perubahan || "0%",
      category: commodity.kategori || "Umum",
      date: commodity.tanggal || new Date().toISOString(),
    };
  };

  const currentCommodityData = getCurrentCommodityData();

  // Prepare historical chart data whenever commodity or timeRange changes
  useEffect(() => {
    if (!selectedCommodity || komoditasData.length === 0) {
      setHistoricalChartData([]);
      return;
    }

    // Calculate date cutoff based on time range
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
      case "180d":
        daysAgo = 180;
        break;
      case "1y":
        daysAgo = 365;
        break;
      default:
        daysAgo = 30;
    }
    
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Filter data for selected commodity and time range
    const commodityData = komoditasData
      .filter(k => {
        if (k.nama !== selectedCommodity) return false;
        if (!k.tanggal) return false;
        const itemDate = new Date(k.tanggal);
        return itemDate >= cutoffDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.tanggal || 0).getTime();
        const dateB = new Date(b.tanggal || 0).getTime();
        return dateA - dateB;
      });

    const chartData = commodityData.map(item => {
      const itemDate = new Date(item.tanggal || "");
      
      // Format date based on time range
      let dateFormat: Intl.DateTimeFormatOptions;
      if (timeRange === "7d") {
        // Show day and date for 7 days
        dateFormat = { weekday: 'short', day: '2-digit', month: 'short' };
      } else if (timeRange === "30d" || timeRange === "90d") {
        // Show date and month for 1-3 months
        dateFormat = { day: '2-digit', month: 'short' };
      } else {
        // Show date, month, and year for 6 months - 1 year
        dateFormat = { day: '2-digit', month: 'short', year: 'numeric' };
      }
      
      return {
        date: itemDate.toLocaleDateString('id-ID', dateFormat),
        fullDate: itemDate.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        }),
        price: item.harga || 0,
        formattedPrice: `Rp ${(item.harga || 0).toLocaleString('id-ID')}`
      };
    });

    setHistoricalChartData(chartData);
  }, [selectedCommodity, komoditasData, timeRange]);

  // Format price helper
  const formatPrice = (price: number) => {
    if (!price || price === 0) return "Belum ada data";
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  // Get market info from komoditas data
  const marketInfo = komoditasData.slice(0, 10).map((item) => ({
    market: "Wonosobo",
    commodity: item.nama || "Tidak diketahui",
    price: formatPrice(item.harga || 0),
    updated: item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) : "-",
  }));

  const calculateSimulation = async () => {
    if (!simulationData.harvestAmount || !currentCommodityData) {
      toast.error("Pilih komoditas dan masukkan jumlah panen");
      return;
    }

    if (!simulationData.harvestDate) {
      toast.error("Pilih tanggal panen");
      return;
    }

    setForecastLoading(true);

    try {
      // Calculate days until harvest
      const harvestDate = new Date(simulationData.harvestDate);
      const today = new Date();
      const daysUntilHarvest = Math.ceil(
        (harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilHarvest < 0) {
        toast.error("Tanggal panen tidak boleh di masa lalu");
        setForecastLoading(false);
        return;
      }

      if (daysUntilHarvest > 90) {
        toast.error("Tanggal panen terlalu jauh (maksimal 90 hari)");
        setForecastLoading(false);
        return;
      }

      // Forecast using Prophet - predict until 14 days after harvest
      const forecast = await forecastCommodityPrice(
        currentCommodityData.name,
        daysUntilHarvest + 14, // Extended to 14 days after harvest
        90
      );

      if (!forecast.success) {
        toast.error(
          forecast.message || "Gagal melakukan forecasting. Data historis mungkin tidak cukup."
        );
        setForecastLoading(false);
        return;
      }

      setForecastData(forecast);

      // Find prediction for harvest date
      const harvestDateStr = simulationData.harvestDate;
      const prediction = forecast.predictions.find(
        (p) => p.date === harvestDateStr
      );

      let estimatedPrice = currentCommodityData.currentPrice;
      let bestSellDate = "Segera";

      if (prediction) {
        estimatedPrice = prediction.predicted_price;
      } else if (forecast.predictions.length > 0) {
        // Use last prediction if exact date not found
        estimatedPrice = forecast.predictions[forecast.predictions.length - 1].predicted_price;
      }

      // Get best selling date from forecast (HARUS SETELAH tanggal panen)
      if (forecast.predictions && forecast.predictions.length > 0) {
        console.log(" Harvest date:", harvestDateStr, harvestDate);
        console.log(" Total predictions:", forecast.predictions.length);
        
        // Filter predictions that are AFTER harvest date (not on harvest date)
        const predictionsAfterHarvest = forecast.predictions.filter((p) => {
          const predDate = new Date(p.date);
          const isAfter = predDate > harvestDate;
          return isAfter;
        });
        
        console.log(" Predictions after harvest:", predictionsAfterHarvest.length);
        
        if (predictionsAfterHarvest.length > 0) {
          // Find the date with HIGHEST predicted price after harvest
          const bestPrediction = predictionsAfterHarvest.reduce((max, current) => 
            current.predicted_price > max.predicted_price ? current : max
          );
          console.log(" Best selling date found:", bestPrediction.date, "Price:", bestPrediction.predicted_price);
          bestSellDate = formatDateID(bestPrediction.date);
        } else {
          // If no predictions after harvest, recommend selling on harvest date
          console.log(" No predictions after harvest, using harvest date");
          bestSellDate = formatDateID(harvestDateStr);
        }
      } else {
        // No forecast data, recommend harvest date
        console.log(" No forecast predictions available");
        bestSellDate = formatDateID(harvestDateStr);
      }

      const amount = parseFloat(simulationData.harvestAmount);
      const totalRevenue = amount * estimatedPrice;

      setSimulationData((prev) => ({
        ...prev,
        estimatedPrice: estimatedPrice,
        totalRevenue: totalRevenue,
        bestSellDate: bestSellDate,
      }));

      toast.success("Prediksi berhasil dihitung dengan Prophet!");
    } catch (error: any) {
      console.error("Forecast error:", error);
      toast.error(
        error.message || "Gagal melakukan forecasting. Pastikan ada cukup data historis."
      );
    } finally {
      setForecastLoading(false);
    }
  };

  // Empty state jika tidak ada data
  if (!loading && komoditasData.length === 0) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Prediksi Harga Komoditas</h1>
          <p className="text-muted-foreground">
            Analisis pasar dan simulasi pendapatan untuk petani
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belum Ada Data dari API</h3>
            <p className="text-muted-foreground mb-6">
              Data harga komoditas dari API Disdagkopukm belum tersedia.
              <br />
              Silakan coba lagi nanti atau hubungi administrator.
            </p>
            <Button onClick={loadPrices} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Muat Ulang Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading && komoditasData.length === 0) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Prediksi Harga Komoditas</h1>
          <p className="text-muted-foreground">
            Memuat data komoditas...
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Memuat data harga komoditas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prediksi Harga Komoditas</h1>
          <p className="text-muted-foreground">
            Analisis pasar dan simulasi pendapatan untuk petani
          </p>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground mt-1">
              Terakhir diperbarui: {lastUpdate}
            </p>
          )}
        </div>
        <Button onClick={loadPrices} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Commodity Selector */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Pilih Komoditas:</span>
                  <Select
                    value={selectedCommodity}
                    onValueChange={setSelectedCommodity}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Pilih komoditas" />
                    </SelectTrigger>
                    <SelectContent>
                      {commodityNames.map((name, idx) => (
                        <SelectItem key={`commodity-${idx}-${name}`} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Rentang Waktu:</span>
                  <Select
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value as any)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">1 Minggu Terakhir</SelectItem>
                      <SelectItem value="30d">1 Bulan Terakhir</SelectItem>
                      <SelectItem value="90d">3 Bulan Terakhir</SelectItem>
                      <SelectItem value="180d">6 Bulan Terakhir</SelectItem>
                      <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentCommodityData && (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">
                      {formatPrice(currentCommodityData.currentPrice)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      per {currentCommodityData.unit}
                    </span>
                    <Badge variant="secondary">
                      {currentCommodityData.change}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="simulation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="simulation">Simulasi Pendapatan</TabsTrigger>
          <TabsTrigger value="markets">Harga Pasar Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simulation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Simulasi Pendapatan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="commodity">Komoditas</Label>
                  <p className="text-sm font-medium mt-1">
                    {currentCommodityData?.name || "Pilih komoditas di atas"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="harvestAmount">
                    Estimasi Hasil Panen ({currentCommodityData?.unit || "kg"})
                  </Label>
                  <Input
                    id="harvestAmount"
                    type="number"
                    value={simulationData.harvestAmount}
                    onChange={(e) =>
                      setSimulationData((prev) => ({
                        ...prev,
                        harvestAmount: e.target.value,
                      }))
                    }
                    placeholder="Contoh: 1000"
                  />
                </div>
                <div>
                  <Label htmlFor="harvestDate">Tanggal Panen</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={simulationData.harvestDate}
                    onChange={(e) =>
                      setSimulationData((prev) => ({
                        ...prev,
                        harvestDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button 
                  onClick={calculateSimulation} 
                  className="w-full" 
                  disabled={!currentCommodityData || forecastLoading}
                >
                  {forecastLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Memprediksi dengan AI...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Prediksi dengan Prophet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Simulation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Hasil Prediksi
                  </div>
                  {forecastData && (
                    <Badge variant="outline" className="text-xs">
                      Model: {forecastData.model}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {simulationData.totalRevenue > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Estimasi Harga
                        </p>
                        <p className="font-medium">
                          {formatPrice(simulationData.estimatedPrice)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Total Pendapatan
                        </p>
                        <p className="font-bold text-green-600">
                          {formatPrice(simulationData.totalRevenue)}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Waktu Jual Terbaik
                      </p>
                      <p className="font-medium">
                        {simulationData.bestSellDate}
                      </p>
                    </div>
                    {currentCommodityData && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Proyeksi Keuntungan
                        </p>
                        <p className="font-medium text-purple-700">
                          +
                          {(
                            ((simulationData.estimatedPrice -
                              currentCommodityData.currentPrice) /
                              currentCommodityData.currentPrice) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground space-y-1">
                      {forecastData ? (
                        <>
                          <p>* Prediksi menggunakan model {forecastData.model}</p>
                          <p>* Berdasarkan {forecastData.historical_data_points} data historis</p>
                          <p>* Akurasi: {forecastData.statistics.price_trend} {Math.abs(forecastData.statistics.trend_percentage).toFixed(1)}%</p>
                          {forecastData.is_synthetic && (
                            <p className="text-orange-600 font-medium">
                              I“AœA¡aˆ©a••A… Menggunakan data sintetis (data historis tidak cukup)
                            </p>
                          )}
                          <p>* Belum termasuk biaya operasional</p>
                        </>
                      ) : (
                        <>
                          <p>* Perhitungan berdasarkan harga pasar real-time</p>
                          <p>* Belum termasuk biaya operasional</p>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Masukkan data untuk melihat simulasi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historical Price Chart - Always visible */}
          {historicalChartData.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Grafik Histori Harga - {currentCommodityData?.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Riwayat harga pasar {
                    timeRange === "7d" ? "1 minggu" :
                    timeRange === "30d" ? "1 bulan" :
                    timeRange === "90d" ? "3 bulan" :
                    timeRange === "180d" ? "6 bulan" :
                    "1 tahun"
                  } terakhir ({historicalChartData.length} data point)
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={historicalChartData}>
                    <defs>
                      <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-semibold text-sm mb-1">{data.fullDate || data.date}</p>
                              <p className="text-lg font-bold text-blue-600">
                                {data.formattedPrice}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="price"
                      name="Harga Pasar"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorHistorical)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {historicalChartData.length > 0 && (() => {
                    const prices = historicalChartData.map(d => d.price);
                    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                    const maxPrice = Math.max(...prices);
                    const minPrice = Math.min(...prices);
                    
                    return (
                      <>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Harga Rata-rata</p>
                          <p className="font-medium text-sm">Rp {avgPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Harga Tertinggi</p>
                          <p className="font-medium text-sm">Rp {maxPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Harga Terendah</p>
                          <p className="font-medium text-sm">Rp {minPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forecast Chart */}
          {forecastData && forecastData.predictions && forecastData.predictions.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Grafik Prediksi Harga - {currentCommodityData?.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Prediksi harga {forecastData.forecast_days} hari ke depan menggunakan {forecastData.model}
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={[
                      ...forecastData.historical.slice(-7).map((h: any) => ({
                        date: new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                        actual: h.actual_price,
                        predicted: h.predicted_price,
                        lower: h.lower_bound,
                        upper: h.upper_bound,
                        type: 'historical'
                      })),
                      ...forecastData.predictions.map((p: any) => ({
                        date: new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                        predicted: p.predicted_price,
                        lower: p.lower_bound,
                        upper: p.upper_bound,
                        type: 'forecast'
                      }))
                    ]}
                  >
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-semibold text-sm mb-2">{data.date}</p>
                              {data.actual && (
                                <p className="text-sm text-blue-600">
                                  Harga Aktual: Rp {data.actual.toLocaleString('id-ID')}
                                </p>
                              )}
                              <p className="text-sm text-green-600">
                                Prediksi: Rp {data.predicted.toLocaleString('id-ID')}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Range: Rp {data.lower.toLocaleString('id-ID')} - Rp {data.upper.toLocaleString('id-ID')}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    {forecastData.historical && forecastData.historical.length > 0 && (
                      <Area
                        type="monotone"
                        dataKey="actual"
                        name="Harga Aktual"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorActual)"
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      name="Prediksi Harga"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPredicted)"
                    />
                    <Line
                      type="monotone"
                      dataKey="upper"
                      stroke="#86efac"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      name="Batas Atas"
                    />
                    <Line
                      type="monotone"
                      dataKey="lower"
                      stroke="#86efac"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      name="Batas Bawah"
                    />
                    {simulationData.harvestDate && (
                      <ReferenceLine
                        x={new Date(simulationData.harvestDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{ value: 'Tanggal Panen', position: 'top', fill: '#f59e0b', fontSize: 12 }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Data Historis</p>
                    <p className="font-medium text-sm">{forecastData.historical_data_points} hari</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Harga Rata-rata</p>
                    <p className="font-medium text-sm">Rp {forecastData.statistics.average_predicted_price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Harga Tertinggi</p>
                    <p className="font-medium text-sm">Rp {forecastData.statistics.max_predicted_price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Harga Terendah</p>
                    <p className="font-medium text-sm">Rp {forecastData.statistics.min_predicted_price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Summary */}
          {currentCommodityData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ringkasan Harga - {currentCommodityData.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Harga Saat Ini</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(currentCommodityData.currentPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    per {currentCommodityData.unit}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Lokasi Pasar</p>
                  <p className="text-lg font-medium">
                    Wonosobo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kategori: {currentCommodityData.category}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tren Harga</p>
                  <p className="text-lg font-medium flex items-center">
                    {currentCommodityData.change}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perubahan harga
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="markets">
          <Card>
            <CardHeader>
              <CardTitle>Harga Pasar Real-time ({komoditasData.length} Data)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketInfo.length > 0 ? (
                  marketInfo.map((market, index) => (
                    <div
                      key={`market-${index}-${market.commodity}-${market.updated}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{market.commodity}</p>
                        <p className="text-sm text-muted-foreground">
                          {market.market}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Diperbarui: {market.updated}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{market.price}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Belum ada data harga pasar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
