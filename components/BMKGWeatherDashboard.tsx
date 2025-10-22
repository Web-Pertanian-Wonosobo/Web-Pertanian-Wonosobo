import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Cloud,
  Droplets,
  Wind,
  Eye,
  MapPin,
  Calendar,
  Thermometer,
} from "lucide-react";
import {
  fetchBMKGDirect,
  WONOSOBO_ADM4_CODES,
  groupForecastsByDay,
  getAverageTemp,
  getTotalRainfall,
  getDominantWeather,
  type ParsedBMKGData,
  type BMKGForecast,
} from "../src/services/bmkgApi";

export function BMKGWeatherDashboard() {
  const [bmkgData, setBmkgData] = useState<ParsedBMKGData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(
    WONOSOBO_ADM4_CODES.WONOSOBO
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBMKGData();
  }, [selectedLocation]);

  const loadBMKGData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBMKGDirect(selectedLocation);
      if (data) {
        setBmkgData(data);
      } else {
        setError("Gagal mengambil data dari BMKG");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <Cloud className="h-12 w-12 mx-auto text-gray-400" />
            <p className="text-muted-foreground">Memuat data cuaca BMKG...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !bmkgData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Cloud className="h-12 w-12 mx-auto mb-3 text-red-500" />
          <p className="text-red-600 mb-4">{error || "Data tidak tersedia"}</p>
          <button
            onClick={loadBMKGData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Coba Lagi
          </button>
        </CardContent>
      </Card>
    );
  }

  const groupedForecasts = groupForecastsByDay(bmkgData.forecasts);
  const days = Object.keys(groupedForecasts).slice(0, 7); // 7 hari pertama

  return (
    <div className="space-y-6">
      {/* Header dengan Info Lokasi */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Data Cuaca BMKG - {bmkgData.location.desa}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {bmkgData.location.kecamatan}, {bmkgData.location.kotkab},{" "}
                {bmkgData.location.provinsi}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                📍 Koordinat: {bmkgData.location.lat}, {bmkgData.location.lon}
              </p>
            </div>

            <div className="w-full md:w-64">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WONOSOBO_ADM4_CODES).map(([name, code]) => (
                    <SelectItem key={code} value={code}>
                      {name.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prakiraan 7 Hari */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {days.map((day, index) => {
          const dayForecasts = groupedForecasts[day];
          const avgTemp = getAverageTemp(dayForecasts);
          const totalRain = getTotalRainfall(dayForecasts);
          const dominantWeather = getDominantWeather(dayForecasts);
          const firstForecast = dayForecasts[0];

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Tanggal */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{day}</h3>
                      <p className="text-xs text-muted-foreground">
                        Hari ke-{index + 1}
                      </p>
                    </div>
                    <Badge variant="outline">{dayForecasts.length}x update</Badge>
                  </div>

                  {/* Icon Cuaca */}
                  {firstForecast.image && (
                    <div className="flex justify-center">
                      <img
                        src={firstForecast.image}
                        alt={dominantWeather}
                        className="h-16 w-16"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Kondisi Cuaca */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{dominantWeather}</p>
                    <p className="text-xs text-muted-foreground">
                      {firstForecast.weather_desc}
                    </p>
                  </div>

                  {/* Suhu */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Thermometer className="h-5 w-5 text-orange-500" />
                      <span className="text-2xl font-bold">{avgTemp}°C</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rata-rata harian
                    </p>
                  </div>

                  {/* Detail Tambahan */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {totalRain.toFixed(1)}mm
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Hujan</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Wind className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium">
                          {Math.round(
                            dayForecasts.reduce((acc, f) => acc + f.ws, 0) /
                              dayForecasts.length
                          )}
                          km/j
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Angin</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Per Jam untuk Hari Pertama */}
      {days.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detail Prakiraan Per Jam - {days[0]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {groupedForecasts[days[0]].map((forecast, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {/* Waktu */}
                  <div className="w-32">
                    <p className="font-medium text-sm">
                      {new Date(forecast.datetime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {forecast.local_datetime.split(" ")[1]}
                    </p>
                  </div>

                  {/* Icon & Kondisi */}
                  <div className="flex items-center gap-2 flex-1">
                    {forecast.image && (
                      <img
                        src={forecast.image}
                        alt={forecast.weather}
                        className="h-8 w-8"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span className="text-sm">{forecast.weather_desc}</span>
                  </div>

                  {/* Data Cuaca */}
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">{forecast.t}°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{forecast.hu}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Cloud className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm">{forecast.tp}mm</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{forecast.ws}km/j</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{forecast.vs_text}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attribution BMKG */}
      <div className="text-center text-sm text-muted-foreground p-4 bg-slate-50 rounded-lg">
        <p>
          📊 Data cuaca bersumber dari{" "}
          <strong>BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)</strong>
        </p>
        <p className="text-xs mt-1">
          <a
            href="https://data.bmkg.go.id/prakiraan-cuaca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            data.bmkg.go.id/prakiraan-cuaca
          </a>
        </p>
      </div>
    </div>
  );
}
