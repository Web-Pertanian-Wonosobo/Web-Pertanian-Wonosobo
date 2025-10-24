import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import {
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Thermometer,
  Droplets,
  Sprout,
  MapPin,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchWeatherPredictions } from "../src/services/weatherApi";
import {
  fetchBMKGDirect,
  groupForecastsByDay,
  getAverageTemp,
  getTotalRainfall,
  getDominantWeather,
  type ParsedBMKGData,
} from "../src/services/bmkgApi";

// Tentukan ikon berdasarkan deskripsi cuaca
const getIconForWeather = (weatherDesc: string) => {
  if (weatherDesc.includes("Cerah")) return Sun;
  if (weatherDesc.includes("Hujan")) return CloudRain;
  if (weatherDesc.includes("Berawan")) return Cloud;
  return Sun;
};

export function WeatherPrediction() {
  const [selectedLocation, setSelectedLocation] = useState("33.07.01.2001"); // default Wonosobo
  const [bmkgDetailData, setBmkgDetailData] = useState<ParsedBMKGData | null>(null);
  const [backendPredictions, setBackendPredictions] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingBMKG, setIsLoadingBMKG] = useState(true);

  // === Ambil data BMKG sesuai lokasi ===
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingBMKG(true);
      try {
        const bmkgDetail = await fetchBMKGDirect(selectedLocation);
        setBmkgDetailData(bmkgDetail);
      } catch (e) {
        console.error("Gagal memuat data BMKG:", e);
      } finally {
        setIsLoadingBMKG(false);
      }
    };
    loadData();
  }, [selectedLocation]);

  // === Prediksi AI ===
  const handlePredictAI = async () => {
    setLoading(true);
    try {
      const predictions = await fetchWeatherPredictions(7);
      setBackendPredictions(predictions);
    } catch (e) {
      console.error("Gagal memuat prediksi AI:", e);
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingBMKG)
    return (
      <div className="p-6 flex justify-center items-center h-screen text-muted-foreground">
        Memuat data BMKG...
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Prediksi Cuaca</h1>
      <p className="text-muted-foreground mb-6">
        Prakiraan cuaca dari BMKG dan prediksi AI/ML berbasis data cuaca terkini.
      </p>

      {/* === Pilihan Lokasi BMKG === */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <label htmlFor="location" className="font-medium mb-2 md:mb-0">
          🌍 Pilih Lokasi BMKG:
        </label>

        <select
          id="location"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="33.07.01.2001">Wonosobo - Banjarmangu</option>
          <option value="33.04.12.1001">Banjarnegara - Sigaluh</option>
          <option value="33.05.01.1001">Banyumas - Purwokerto</option>
          <option value="33.01.03.1001">Magelang - Secang</option>
          <option value="33.15.01.1001">Temanggung - Parakan</option>
        </select>
      </div>

      {/* === Tab Navigasi === */}
      <Tabs defaultValue="bmkg" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bmkg">Prakiraan Cuaca BMKG</TabsTrigger>
          <TabsTrigger value="ml">Prediksi AI/ML</TabsTrigger>
        </TabsList>

        {/* ========== TAB BMKG ========== */}
        <TabsContent value="bmkg">
          <div className="space-y-6">
            {/* Info Lokasi BMKG */}
            {bmkgDetailData && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">
                          {bmkgDetailData.location.desa || "-"},{" "}
                          {bmkgDetailData.location.kecamatan || "-"}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bmkgDetailData.location.kotkab ||
                          bmkgDetailData.location.provinsi ||
                          "Data wilayah tidak tersedia"}
                      </p>
                      {bmkgDetailData.location.lat && bmkgDetailData.location.lon ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 Koordinat: {bmkgDetailData.location.lat},{" "}
                          {bmkgDetailData.location.lon}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 Koordinat tidak tersedia
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      <Cloud className="h-3 w-3 mr-1" />
                      Data BMKG
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prakiraan Harian */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-blue-600" />
                  Prakiraan Cuaca Harian
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bmkgDetailData && bmkgDetailData.forecasts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {(() => {
                      const grouped = groupForecastsByDay(bmkgDetailData.forecasts);
                      return Object.keys(grouped)
                        .slice(0, 5)
                        .map((day, index) => {
                          const daily = grouped[day];
                          const avg = getAverageTemp(daily);
                          const rain = getTotalRainfall(daily);
                          const weather = getDominantWeather(daily);
                          const Icon = getIconForWeather(weather);
                          return (
                            <Card key={index} className="hover:shadow-md border-2">
                              <CardContent className="p-4 text-center space-y-2">
                                <h3 className="font-semibold">{day}</h3>
                                <Icon className="h-8 w-8 mx-auto text-blue-500" />
                                <p className="text-sm">{weather}</p>
                                <p className="text-lg font-bold">{avg}°C</p>
                                <p className="text-xs text-muted-foreground">
                                  Hujan: {rain.toFixed(1)} mm
                                </p>
                              </CardContent>
                            </Card>
                          );
                        });
                    })()}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Data BMKG tidak tersedia.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Detail Prakiraan Per Jam */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  Detail Prakiraan Per Jam
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  (Data per jam dari BMKG untuk lokasi yang dipilih)
                </p>
                {bmkgDetailData?.forecasts && bmkgDetailData.forecasts.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {bmkgDetailData.forecasts.slice(0, 12).map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-sm">
                        <span>
                          {new Date(item.datetime).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>{item.weatherDesc}</span>
                        <span>{item.temperature}°C</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Tidak ada data per jam untuk lokasi ini.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Detail Hari Pertama */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-green-600" />
                  Detail Prediksi Hari Pertama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <Thermometer className="h-5 w-5 mx-auto text-orange-500" />
                    <p className="text-sm">Suhu</p>
                    <p className="font-bold text-lg">19.1°C</p>
                  </div>
                  <div>
                    <Droplets className="h-5 w-5 mx-auto text-blue-500" />
                    <p className="text-sm">Batas Bawah</p>
                    <p className="font-bold text-lg">13.7°C</p>
                  </div>
                  <div>
                    <Thermometer className="h-5 w-5 mx-auto text-red-500" />
                    <p className="text-sm">Batas Atas</p>
                    <p className="font-bold text-lg">24.6°C</p>
                  </div>
                  <div>
                    <Sprout className="h-5 w-5 mx-auto text-green-500" />
                    <p className="text-sm">Saran Tanam</p>
                    <Badge className="bg-green-100 text-green-700">
                      Sangat Baik
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== TAB AI/ML ========== */}
        <TabsContent value="ml">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <CardTitle>Prediksi Cuaca AI / ML</CardTitle>
              </div>
              <Button
                onClick={handlePredictAI}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white mt-3 md:mt-0"
              >
                {loading ? "Memproses..." : "Prediksi AI/ML"}
              </Button>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">
                  Menghitung prediksi cuaca...
                </p>
              ) : backendPredictions && backendPredictions.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {backendPredictions.map((day: any, index: number) => {
                      const date = new Date(day.date);
                      const Icon = getIconForWeather(day.weather || "");
                      return (
                        <Card key={index} className="text-center border-2">
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h3 className="font-medium">
                                {date.toLocaleDateString("id-ID", { weekday: "short" })}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                              </p>
                            </div>
                            <Icon className="h-10 w-10 mx-auto text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Prediksi Suhu</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {day.predicted_temp?.toFixed(1)}°C
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Rentang: {day.lower_bound?.toFixed(1)} - {day.upper_bound?.toFixed(1)}°C
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Grafik */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Grafik Prediksi Suhu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={backendPredictions.map((pred: any) => ({
                            date: new Date(pred.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            }),
                            suhu: pred.predicted_temp,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="suhu"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ fill: "#f59e0b", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Tombol tambahan */}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline">Simpan Hasil Prediksi</Button>
                    <Button variant="outline">Analisis Lanjutan</Button>
                    <Button variant="outline">Unduh Laporan</Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Belum ada hasil prediksi. Klik tombol di atas untuk memulai.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
