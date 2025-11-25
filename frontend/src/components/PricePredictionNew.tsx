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
  TrendingDown,
  Calculator,
  DollarSign,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAllKomoditas, type Komoditas } from "../services/komoditasApi";

export function PricePrediction() {
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [komoditasData, setKomoditasData] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
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

  // Get commodity names
  const commodityNames = komoditasData
    .map((k) => k.nama)
    .filter((n): n is string => Boolean(n));

  // Get current commodity data
  const getCurrentCommodityData = () => {
    if (!selectedCommodity || komoditasData.length === 0) return null;

    const commodity = komoditasData.find((k) => k.nama === selectedCommodity);
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
    updated: item.tanggal
      ? new Date(item.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-",
  }));

  const calculateSimulation = () => {
    if (!simulationData.harvestAmount || !currentCommodityData) {
      toast.error("Pilih komoditas dan masukkan jumlah panen");
      return;
    }

    const amount = parseFloat(simulationData.harvestAmount);
    const estimatedPrice = currentCommodityData.currentPrice * 1.05; // Assume 5% price increase
    const totalRevenue = amount * estimatedPrice;

    setSimulationData((prev) => ({
      ...prev,
      estimatedPrice: estimatedPrice,
      totalRevenue: totalRevenue,
      bestSellDate: "5-10 Agustus 2025",
    }));

    toast.success("Simulasi berhasil dihitung");
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
            <h3 className="text-xl font-semibold mb-2">
              Belum Ada Data dari API
            </h3>
            <p className="text-muted-foreground mb-6">
              Data harga komoditas dari API Disdagkopukm belum tersedia.
              <br />
              Silakan coba lagi nanti atau hubungi administrator.
            </p>
            <Button onClick={loadPrices} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
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
          <p className="text-muted-foreground">Memuat data komoditas...</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Memuat data harga komoditas...
            </p>
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
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
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
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pilih komoditas" />
                  </SelectTrigger>
                  <SelectContent>
                    {commodityNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentCommodityData && (
                  <>
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
                  </>
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
                  disabled={!currentCommodityData}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Hitung Simulasi
                </Button>
              </CardContent>
            </Card>

            {/* Simulation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Hasil Simulasi
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
                    <div className="text-sm text-muted-foreground">
                      <p>* Perhitungan berdasarkan harga pasar real-time</p>
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

          {/* Price Summary */}
          {currentCommodityData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  Ringkasan Harga - {currentCommodityData.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Harga Saat Ini
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(currentCommodityData.currentPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    per {currentCommodityData.unit}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Lokasi Pasar</p>
                  <p className="text-lg font-medium">Wonosobo</p>
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
              <CardTitle>
                Harga Pasar Real-time ({komoditasData.length} Data)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketInfo.length > 0 ? (
                  marketInfo.map((market, index) => (
                    <div
                      key={index}
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
                        <p className="text-lg font-bold text-green-600">
                          {market.price}
                        </p>
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
