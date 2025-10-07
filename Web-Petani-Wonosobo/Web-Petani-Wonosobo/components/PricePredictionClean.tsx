import React, { useState, useEffect } from "react";
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
  TrendingUp,
  Calculator,
  DollarSign,
  Wheat,
  Download,
  FileText,
  Share2,
  RefreshCw,
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
} from "recharts";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { MockAPIService, BACKEND_AVAILABLE } from "../src/mockAPI";

// Types
interface PriceData {
  success: boolean;
  data: {
    bapanas?: {
      data: Array<{
        komoditas: string;
        harga: number;
        satuan: string;
        tanggal: string;
        provinsi: string;
        kota: string;
      }>;
    };
    local_markets?: any;
  };
}

interface HistoricalData {
  success: boolean;
  data: {
    commodity: string;
    history: Array<{
      tanggal: string;
      harga: number;
      satuan: string;
    }>;
    predictions: Array<{
      tanggal: string;
      harga_prediksi: number;
      satuan: string;
      confidence: number;
    }>;
  };
}

interface MarketData {
  data: Array<{
    nama_pasar: string;
    alamat: string;
    komoditas: Array<{
      nama: string;
      harga: number;
      satuan: string;
      stok: string;
    }>;
    jam_operasional: string;
    hari_pasar: string;
  }>;
}

// Service untuk mengambil data harga
class PriceService {
  static async fetchPrices(commodity?: string): Promise<PriceData> {
    try {
      if (BACKEND_AVAILABLE) {
        const response = await fetch(`http://localhost:8000/api/market/prices?commodity=${commodity || ''}`);
        if (response.ok) {
          return await response.json();
        }
      }
      
      console.log("🔄 Using Mock API for price data");
      return await MockAPIService.fetchPrices(commodity);
    } catch (error) {
      console.error("Error fetching prices:", error);
      return await MockAPIService.fetchPrices(commodity);
    }
  }

  static async fetchPriceHistory(commodity: string): Promise<HistoricalData> {
    try {
      if (BACKEND_AVAILABLE) {
        const response = await fetch(`http://localhost:8000/api/market/price-history?commodity=${commodity}`);
        if (response.ok) {
          return await response.json();
        }
      }
      
      console.log("🔄 Using Mock API for price history");
      return await MockAPIService.fetchPriceHistory(commodity);
    } catch (error) {
      console.error("Error fetching price history:", error);
      return await MockAPIService.fetchPriceHistory(commodity);
    }
  }

  static async fetchLocalMarkets(): Promise<MarketData> {
    try {
      if (BACKEND_AVAILABLE) {
        const response = await fetch('http://localhost:8000/api/market/markets');
        if (response.ok) {
          return await response.json();
        }
      }
      
      console.log("🔄 Using Mock API for local markets");
      return await MockAPIService.fetchLocalMarkets();
    } catch (error) {
      console.error("Error fetching local markets:", error);
      return await MockAPIService.fetchLocalMarkets();
    }
  }
}

export function PricePrediction() {
  const [selectedCommodity, setSelectedCommodity] = useState("beras");
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [simulationData, setSimulationData] = useState({
    harvestAmount: "",
    harvestDate: "",
    estimatedPrice: 0,
    totalRevenue: 0,
    bestSellDate: "",
  });

  // Load data saat komponen pertama kali dimuat
  useEffect(() => {
    loadAllData();
  }, []);

  // Load data ketika commodity berubah
  useEffect(() => {
    if (selectedCommodity) {
      loadCommodityData();
    }
  }, [selectedCommodity]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [pricesResponse, marketsResponse] = await Promise.all([
        PriceService.fetchPrices(),
        PriceService.fetchLocalMarkets()
      ]);
      
      setPriceData(pricesResponse);
      setMarketData(marketsResponse);
    } catch (error) {
      toast.error("Gagal memuat data harga");
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommodityData = async () => {
    try {
      const historyResponse = await PriceService.fetchPriceHistory(selectedCommodity);
      setHistoricalData(historyResponse);
    } catch (error) {
      console.error("Error loading commodity data:", error);
    }
  };

  const refreshData = async () => {
    await loadAllData();
    await loadCommodityData();
    toast.success("Data berhasil diperbarui");
  };

  // Fungsi untuk mendapatkan data komoditas saat ini
  const getCurrentCommodityData = () => {
    if (!priceData?.data?.bapanas?.data) return null;
    
    const commodityMap: { [key: string]: string } = {
      beras: "Beras Premium",
      cabai: "Cabai Merah Keriting",
      bawang_merah: "Bawang Merah",
      jagung: "Jagung Pipilan Kering"
    };
    
    const commodityName = commodityMap[selectedCommodity];
    const commodity = priceData.data.bapanas.data.find(
      (item) => item.komoditas === commodityName
    );
    
    if (!commodity) return null;
    
    return {
      name: commodity.komoditas,
      currentPrice: commodity.harga,
      unit: commodity.satuan,
      trend: "up" as const,
      change: "+2.5%",
      icon: Wheat,
    };
  };

  const calculateSimulation = () => {
    const currentCommodity = getCurrentCommodityData();
    if (!simulationData.harvestAmount || !currentCommodity) return;

    const amount = parseFloat(simulationData.harvestAmount);
    const estimatedPrice = currentCommodity.currentPrice * 1.05; // Assume 5% price increase
    const totalRevenue = amount * estimatedPrice;

    setSimulationData((prev) => ({
      ...prev,
      estimatedPrice: estimatedPrice,
      totalRevenue: totalRevenue,
      bestSellDate: "5-10 Oktober 2025",
    }));
  };

  const downloadPredictionReport = () => {
    const currentCommodity = getCurrentCommodityData();
    if (!currentCommodity) return;

    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("LAPORAN PREDIKSI HARGA KOMODITAS", 10, 20);
    doc.setFontSize(14);
    doc.text("ECOSCOPE WONOSOBO", 10, 28);

    doc.setFontSize(12);
    doc.text(`Komoditas: ${currentCommodity.name}`, 10, 45);
    doc.text(`Harga Saat Ini: Rp ${currentCommodity.currentPrice.toLocaleString()}`, 10, 55);
    doc.text(`Tren: ${currentCommodity.trend === "up" ? "Naik" : "Turun"} ${currentCommodity.change}`, 10, 65);
    doc.text(`Waktu Analisis: ${new Date().toLocaleString("id-ID")}`, 10, 75);

    doc.save(
      `prediksi-harga-${selectedCommodity}-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    toast.success("Laporan prediksi berhasil didownload");
  };

  const shareSimulation = () => {
    if (simulationData.totalRevenue === 0) {
      toast.error("Tidak ada simulasi untuk dibagikan");
      return;
    }

    const currentCommodity = getCurrentCommodityData();
    if (!currentCommodity) return;

    const shareText = `📊 Simulasi Pendapatan ${currentCommodity.name}\n\n🌾 Jumlah: ${simulationData.harvestAmount} kg\n💰 Estimasi: Rp ${simulationData.totalRevenue.toLocaleString()}\n📅 Jual Terbaik: ${simulationData.bestSellDate}\n\nVia EcoScope Wonosobo 🌱`;

    navigator.clipboard.writeText(shareText).then(() => {
      toast.success("Hasil simulasi disalin ke clipboard");
    });
  };

  const currentCommodity = getCurrentCommodityData();
  
  // Prepare chart data
  const chartData = historicalData?.data ? [
    ...historicalData.data.history.map(item => ({
      date: item.tanggal.split('-').slice(1).reverse().join('/'),
      price: item.harga,
      prediction: null
    })),
    ...historicalData.data.predictions.map(item => ({
      date: item.tanggal.split('-').slice(1).reverse().join('/'),
      price: null,
      prediction: item.harga_prediksi
    }))
  ] : [];

  if (isLoading) {
    return (
      <div className="p-6 max-w-8xl mx-auto flex justify-center items-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Memuat data harga komoditas...
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {BACKEND_AVAILABLE ? "Menggunakan backend API" : "🔄 Menggunakan Mock API (Backend tidak tersedia)"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Prediksi Harga Komoditas</h1>
        <p className="text-muted-foreground">
          Analisis pasar dan simulasi pendapatan untuk petani Wonosobo
        </p>
        {!BACKEND_AVAILABLE && (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              🔄 Mode Demo: Menggunakan data simulasi karena backend belum tersedia
            </p>
          </div>
        )}
      </div>

      {/* Commodity Selector */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Pilih Komoditas:</span>
                <Select
                  value={selectedCommodity}
                  onValueChange={setSelectedCommodity}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beras">Beras</SelectItem>
                    <SelectItem value="cabai">Cabai Merah</SelectItem>
                    <SelectItem value="bawang_merah">Bawang Merah</SelectItem>
                    <SelectItem value="jagung">Jagung</SelectItem>
                  </SelectContent>
                </Select>
                {currentCommodity && (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">
                      Rp {currentCommodity.currentPrice.toLocaleString()}
                    </span>
                    <Badge
                      variant={
                        currentCommodity.trend === "up"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {currentCommodity.change}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                <Button variant="outline" onClick={downloadPredictionReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Laporan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="charts">Grafik Harga</TabsTrigger>
          <TabsTrigger value="simulation">Simulasi</TabsTrigger>
          <TabsTrigger value="markets">Info Pasar</TabsTrigger>
        </TabsList>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Chart */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Tren Harga {currentCommodity?.name || selectedCommodity}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          `Rp ${value?.toLocaleString()}`,
                          name === "price" ? "Harga Aktual" : "Prediksi",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="price"
                      />
                      <Line
                        type="monotone"
                        dataKey="prediction"
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        name="prediction"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                      <span>Harga Aktual</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 border-2 border-orange-500 border-dashed rounded mr-2"></div>
                      <span>Prediksi</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ringkasan Harga</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCommodity && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Harga Saat Ini
                        </p>
                        <p className="text-2xl font-bold">
                          Rp {currentCommodity.currentPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Prediksi 1 Minggu
                        </p>
                        <p className="text-lg font-medium">
                          Rp {(currentCommodity.currentPrice * 1.05).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Prediksi 1 Bulan
                        </p>
                        <p className="text-lg font-medium">
                          Rp {(currentCommodity.currentPrice * 1.03).toLocaleString()}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rekomendasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-green-600">
                      💡 Waktu Jual Terbaik:
                    </p>
                    <p>5-10 Oktober 2025</p>
                    <p className="font-medium text-blue-600 mt-3">
                      📈 Analisis:
                    </p>
                    <p>
                      Harga diprediksi naik 3-5% dalam 2 minggu ke depan berdasarkan
                      tren pasar.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

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
                  <Label htmlFor="harvestAmount">
                    Estimasi Hasil Panen (kg)
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
                <Button onClick={calculateSimulation} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Hitung Simulasi
                </Button>
              </CardContent>
            </Card>

            {/* Simulation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Hasil Simulasi
                  </div>
                  {simulationData.totalRevenue > 0 && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={shareSimulation}
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
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
                          Rp {simulationData.estimatedPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Total Pendapatan
                        </p>
                        <p className="font-bold text-green-600">
                          Rp {simulationData.totalRevenue.toLocaleString()}
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
                    {currentCommodity && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Proyeksi Keuntungan
                        </p>
                        <p className="font-medium text-purple-700">
                          +
                          {(
                            ((simulationData.estimatedPrice -
                              currentCommodity.currentPrice) /
                              currentCommodity.currentPrice) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      <p>* Perhitungan berdasarkan prediksi harga pasar</p>
                      <p>* Belum termasuk biaya operasional</p>
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
        </TabsContent>

        <TabsContent value="markets">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Prices */}
            <Card>
              <CardHeader>
                <CardTitle>Harga Pasar Real-time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData?.data?.map((market, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">{market.nama_pasar}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {market.alamat} • {market.jam_operasional}
                      </p>
                      <div className="space-y-2">
                        {market.komoditas.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{item.nama}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({item.stok})
                              </span>
                            </div>
                            <span className="font-bold">
                              Rp {item.harga.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Referensi Harga Resmi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Sumber: {BACKEND_AVAILABLE ? "Badan Pangan Nasional (Bapanas)" : "Mock Data (Demo Mode)"}
                    </p>
                    <p className="font-medium">Harga Eceran Tertinggi (HET)</p>
                  </div>
                  <div className="space-y-2">
                    {priceData?.data?.bapanas?.data?.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.komoditas}</span>
                        <span className="font-medium">
                          Rp {item.harga.toLocaleString()}/{item.satuan}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * {BACKEND_AVAILABLE ? "Data diperbarui dari API Bapanas" : "Data simulasi untuk demo"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}