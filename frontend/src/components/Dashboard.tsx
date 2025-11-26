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
  Map,
} from "lucide-react";
import { fetchAllKomoditas, type Komoditas } from "../services/komoditasApi";
import { fetchWilayah, type Wilayah } from "../services/wilayahApi";

interface WeatherDistrict {
  name: string;
  temperature: number;
  condition: string;
  risk: string;
  hasData?: boolean;
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
  const [totalCommodityCount, setTotalCommodityCount] = useState(0);
  const [wilayahData, setWilayahData] = useState<Wilayah[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingCommodity, setLoadingCommodity] = useState(true);
  const [loadingWilayah, setLoadingWilayah] = useState(true);

  // === Fetch Data Wilayah dari Disdukcapil ===
  useEffect(() => {
    const loadWilayah = async () => {
      setLoadingWilayah(true);
      try {
        console.log("📍 Memuat data wilayah dari Disdukcapil...");
        const data = await fetchWilayah();
        console.log("✅ Data wilayah berhasil dimuat:", data.length, "total wilayah");
        
        // Filter hanya kecamatan (kode 6 digit), bukan desa/kelurahan
        const kecamatanOnly = data.filter(w => w.kode && w.kode.length === 6);
        console.log("🔍 Filter kecamatan saja:", kecamatanOnly.length, "kecamatan");
        console.log("📋 Daftar kecamatan:", kecamatanOnly.map(w => w.nama).join(", "));
        
        setWilayahData(kecamatanOnly);
        console.log("💾 State wilayahData diupdate dengan", kecamatanOnly.length, "kecamatan");
      } catch (error) {
        console.error("❌ Gagal memuat data wilayah:", error);
        setWilayahData([]);
      } finally {
        setLoadingWilayah(false);
      }
    };

    loadWilayah();
  }, []);

  // === Fetch Data Cuaca dari Backend ===
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/weather/current");
        if (!response.ok) throw new Error("Gagal mengambil data cuaca");
        const data = await response.json();

        console.log("🌤️ Data cuaca dari backend BMKG:", data);

        const normalized = (data.data || []).map((item: any) => ({
          name: item.location_name || "Tidak diketahui",
          temperature: Number(item.temperature || 0),
          condition: item.condition || "-",
          risk: item.risk || "Rendah",
          hasData: true
        }));

        console.log("✅ Data cuaca berhasil dimuat:", normalized.length, "kecamatan");
        setWeatherData(normalized);
      } catch (error) {
        console.error("❌ Gagal memuat data cuaca:", error);
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

  // === Fetch Data Komoditas dari API Disdagkopukm ===
  useEffect(() => {
    const fetchCommodities = async () => {
      setLoadingCommodity(true);
      try {
        const data = await fetchAllKomoditas();
        console.log("Data komoditas lengkap dari semua API:", data);

        // Group by commodity name dan ambil data terbaru (menggunakan object biasa)
        const commodityObj: Record<string, { name: string; price: number; change: string; date: string }> = {};
        
        data.forEach((item: Komoditas) => {
          const name = item.nama || "Tidak diketahui";
          const price = item.harga || 0;
          const date = item.tanggal || "";
          const change = item.perubahan || "0%";
          
          // Jika belum ada atau tanggal lebih baru, update
          if (!commodityObj[name] || date > commodityObj[name].date) {
            commodityObj[name] = { name, price, change, date };
          }
        });
        
        // Convert object to array (unique commodities only)
        const allCommodities = Object.values(commodityObj).map(item => ({
          name: item.name,
          price: item.price,
          change: item.change,
          date: item.date,
        }));

        // Set total count before slicing
        setTotalCommodityCount(allCommodities.length);

        // Sort by date (terbaru di atas) dan ambil 10 teratas
        const sortedCommodities = allCommodities
          .sort((a, b) => {
            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();
            return dateB - dateA; // Descending (terbaru dulu)
          })
          .slice(0, 10);

        console.log(`✅ Total unique commodities: ${allCommodities.length}, Menampilkan 10 terbaru`);
        setCommodityData(sortedCommodities);
      } catch (error) {
        console.error("Gagal memuat data komoditas:", error);
        setCommodityData([]);
      } finally {
        setLoadingCommodity(false);
      }
    };

    fetchCommodities();
    
    // Auto refresh tiap 10 menit
    const interval = setInterval(fetchCommodities, 10 * 60 * 1000);
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
                  {loadingWilayah ? "..." : wilayahData.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loadingWilayah ? "Memuat..." : "Kab. Wonosobo"}
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
                  {loadingCommodity ? "..." : totalCommodityCount || 0}
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
            <div>
              <span>Ringkasan Cuaca per Kecamatan</span>
              <p className="text-sm font-normal text-gray-500 mt-1">
                {loadingWeather 
                  ? "Memuat data cuaca..." 
                  : `Data cuaca real-time untuk ${weatherData.length} kecamatan`
                }
              </p>
            </div>
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
            <>
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
              <div className="mt-4 pt-4 border-t text-sm text-gray-500 text-center">
                Data cuaca real-time dari BMKG. Klik "Lihat Semua" untuk prediksi lengkap.
              </div>
            </>
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
                    <span className={`font-semibold ${item.price && item.price > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                      {item.price && item.price > 0 
                        ? `Rp ${item.price.toLocaleString()}` 
                        : "Belum ada data"}
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

      {/* Daftar Wilayah Kecamatan */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <span>Daftar Kecamatan Wonosobo</span>
              <p className="text-sm font-normal text-gray-500 mt-1">
                {loadingWilayah ? "Memuat..." : `Total ${wilayahData.length} kecamatan di Kabupaten Wonosobo`}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onNavigate("wilayah")}
            >
              <Eye className="w-4 h-4 mr-2" />
              Lihat Detail
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWilayah ? (
            <p className="text-center text-gray-500 py-8">
              Memuat data kecamatan dari Disdukcapil...
            </p>
          ) : wilayahData.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {wilayahData.map((wilayah) => (
                  <div
                    key={wilayah.id}
                    className="p-3 border rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                    title={`Kode: ${wilayah.kode}`}
                    onClick={() => onNavigate("wilayah")}
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {wilayah.nama}
                        </h4>
                        <p className="text-xs text-gray-500">{wilayah.kode}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Data kecamatan tidak tersedia.
            </p>
          )}
          <div className="mt-4 pt-4 border-t text-sm text-gray-600">
            <p className="flex items-center justify-center space-x-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Data resmi dari Disdukcapil Kabupaten Wonosobo</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
