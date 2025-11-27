import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  fetchRealtimeMarketPrices,
  syncMarketData,
  formatPrice,
  calculatePriceTrend,
  groupPricesByCommodity,
  type MarketPrice,
} from "../services/marketApi";

export function RealtimeMarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Load real-time prices
  const loadPrices = async () => {
    setLoading(true);
    try {
      const result = await fetchRealtimeMarketPrices();
      if (result.success && result.data) {
        setPrices(result.data);
        setLastUpdate(new Date().toLocaleString("id-ID"));
        toast.success(`${result.total} data harga berhasil dimuat`);
      } else {
        toast.error(
          "Gagal memuat data harga: " + (result.error || "Unknown error")
        );
      }
    } catch (error) {
      toast.error("Error loading prices");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sync data to database
  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncMarketData();
      if (result.error) {
        toast.error("Sinkronisasi gagal: " + result.error);
      } else {
        toast.success(result.message);
        // Reload prices after sync
        await loadPrices();
      }
    } catch (error) {
      toast.error("Error syncing data");
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    loadPrices();

    const interval = setInterval(() => {
      loadPrices();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Group prices by commodity
  const groupedPrices = groupPricesByCommodity(prices);

  // Get unique commodities
  const commodities = Array.from(groupedPrices.keys()) as string[];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Harga Pasar Real-time</h1>
          <p className="text-muted-foreground">
            Data langsung dari API Disdagkopukm Wonosobo
          </p>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground mt-1">
              Terakhir diperbarui: {lastUpdate}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPrices} disabled={loading} variant="outline">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleSync} disabled={syncing}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
            />
            Sync ke Database
          </Button>
        </div>
      </div>

      {loading && prices.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Memuat data harga...</p>
        </div>
      ) : prices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Tidak ada data harga tersedia
            </p>
            <Button onClick={loadPrices} className="mt-4">
              Muat Ulang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commodities.map((commodity) => {
            const commodityPrices = groupedPrices.get(commodity) || [];
            const trend = calculatePriceTrend(commodityPrices);
            const latestPrice = commodityPrices[0];

            return (
              <Card
                key={commodity}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{commodity}</span>
                    <Badge
                      variant={
                        trend.trend === "up"
                          ? "default"
                          : trend.trend === "down"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {trend.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : trend.trend === "down" ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : null}
                      {trend.changePercent > 0 ? "+" : ""}
                      {trend.changePercent.toFixed(1)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Harga Saat Ini
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(latestPrice.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        per {latestPrice.unit}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Lokasi</p>
                        <p className="font-medium">
                          {latestPrice.market_location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Kategori</p>
                        <p className="font-medium">{latestPrice.category}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Tanggal:{" "}
                        {new Date(latestPrice.date).toLocaleDateString("id-ID")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sumber: {latestPrice.source}
                      </p>
                    </div>

                    {commodityPrices.length > 1 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {commodityPrices.length} lokasi pasar lainnya
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Statistics Summary */}
      {prices.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Data</p>
              <p className="text-2xl font-bold">{prices.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Komoditas</p>
              <p className="text-2xl font-bold">{commodities.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Harga Tertinggi</p>
              <p className="text-2xl font-bold">
                {formatPrice(Math.max(...prices.map((p) => p.price)))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Harga Terendah</p>
              <p className="text-2xl font-bold">
                {formatPrice(Math.min(...prices.map((p) => p.price)))}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
