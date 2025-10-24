import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  CloudRain,
  TrendingUp,
  Mountain,
  MapPin,
  ArrowRight,
  Thermometer,
  Wind,
  Eye,
} from "lucide-react";

interface WeatherDistrict {
  name: string;
  temperature: number;
  condition: string;
  risk: string;
}

interface Commodity {
  name: string;
  price?: number;
  change?: string;
}

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [weatherData, setWeatherData] = useState<WeatherDistrict[]>([]);
  const [commodityData, setCommodityData] = useState<Commodity[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingCommodity, setLoadingCommodity] = useState(true);

  // === Fetch Data Cuaca dari Backend ===
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/weather/current");
        if (!response.ok) throw new Error("Gagal mengambil data cuaca");
        const data = await response.json();

        console.log("Data cuaca dari backend:", data);

        const normalized = (data.data || []).map((item: any) => ({
          name: item.location_name || "Tidak diketahui",
          temperature: Number(item.temperature || 0),
          condition: item.condition || "-",
          risk: item.risk || "Rendah",
        }));

        setWeatherData(normalized);
      } catch (error) {
        console.error("Gagal memuat data cuaca:", error);
        setWeatherData([]);
      } finally {
        setLoadingWeather(false);
      }
    };

    // Panggil pertama kali
    fetchWeather();

    // Auto refresh tiap 5 menit
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // === Fetch Data Komoditas ===
  useEffect(() => {
    const fetchCommodities = async () => {
      setLoadingCommodity(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/market/all");
        if (!response.ok) throw new Error("Gagal mengambil data komoditas");
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          console.warn("Data komoditas kosong atau tidak valid");
          setCommodityData([]);
        } else {
          setCommodityData(data);
        }
      } catch (error) {
        console.error("Gagal memuat data komoditas:", error);
        setCommodityData([]);
      } finally {
        setLoadingCommodity(false);
      }
    };

    // Panggil pertama kali
    fetchCommodities();

    // Auto refresh tiap 5 menit
    const interval = setInterval(fetchCommodities, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Tinggi":
        return "text-red-600 bg-red-100";
      case "Sedang":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  const avgTemp =
    weatherData.length > 0
      ? (
          weatherData.reduce((sum, d) => sum + (d.temperature || 0), 0) /
          weatherData.length
        ).toFixed(1)
      : "-";

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Monitoring
          </h1>
          <p className="text-gray-600 mt-1">
            Sistem Monitoring Pertanian Kabupaten Wonosobo
          </p>
          <p className="text-gray-500 text-sm mt-1">
            🔄 Data diperbarui otomatis setiap 5 menit
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>Wonosobo, Jawa Tengah</span>
        </div>
      </div>

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kecamatan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingWeather ? "..." : weatherData.length}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Suhu Rata-rata
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingWeather ? "..." : `${avgTemp}°C`}
                </p>
              </div>
              <Thermometer className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Komoditas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingCommodity ? "..." : commodityData.length || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Akses Gratis</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ringkasan Cuaca */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ringkasan Cuaca per Kecamatan</span>
            <Button variant="outline" size="sm" onClick={() => onNavigate("weather")}>
              <Eye className="w-4 h-4 mr-2" />
              Lihat Semua
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWeather ? (
            <p className="text-center text-gray-500 py-8">
              Memuat data cuaca...
            </p>
          ) : weatherData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weatherData.map((district, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{district.name}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                        district.risk
                      )}`}
                    >
                      {district.risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Thermometer className="w-4 h-4" />
                      <span>{district.temperature}°C</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Wind className="w-4 h-4" />
                      <span>{district.condition}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Data cuaca tidak tersedia.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ringkasan Harga Komoditas */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle>Ringkasan Harga Komoditas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCommodity ? (
            <p className="text-center text-gray-500 py-8">
              Memuat data harga komoditas...
            </p>
          ) : commodityData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commodityData.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-green-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-700">
                    Harga:{" "}
                    <span className="font-semibold text-green-700">
                      Rp {item.price?.toLocaleString() || "-"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Perubahan: {item.change || "-"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Belum ada data harga komoditas dari AI Market.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
