import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Thermometer,
  Droplets,
  Sprout,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { MockAPIService, BACKEND_AVAILABLE } from "../src/mockAPI";

const fetchBMKGData = async (adm4Code: string) => {
  console.log(`🌤️ Fetching weather data for: ${adm4Code}`);
  
  try {
    if (BACKEND_AVAILABLE) {
      console.log("📡 Trying backend API...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(
          `http://localhost:8000/api/weather/forecast?adm4_code=${adm4Code}&days=7`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const result = await response.json();
          console.log("✅ Backend API success:", result);
          
          if (result.success && result.data) {
            return { 
              location: result.data.location, 
              forecast: result.data.forecast 
            };
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.log("❌ Backend API failed:", fetchError);
      }
    }
    
    // Always fallback to mock API
    console.log("🔄 Using Mock API for weather data");
    const mockResult = await MockAPIService.fetchWeatherData(adm4Code);
    console.log("✅ Mock API success:", mockResult);
    
    return {
      location: mockResult.data.location,
      forecast: mockResult.data.forecast
    };
    
  } catch (error) {
    console.error("💥 Critical error in fetchBMKGData:", error);
    
    // Emergency fallback with basic data
    return {
      location: {
        province: "Jawa Tengah",
        regency: "Wonosobo", 
        district: "Wonosobo",
        village: "Emergency Data",
        coordinates: { lat: -7.36, lon: 109.90 }
      },
      forecast: [
        {
          date: new Date().toISOString().split('T')[0],
          weather: "Cerah",
          temp_min: 18,
          temp_max: 28,
          humidity: 75,
          rainfall: 0
        }
      ]
    };
  }
};

// Fungsi untuk menganalisis data cuaca dan memberikan rekomendasi AI
const analyzeWithAI = (weatherData?: any) => {
  console.log("🤖 Analyzing weather data with AI...");
  
  // === LOGIKA AI ANDA DI SINI ===
  // Ini adalah data simulasi, perlu disesuaikan dengan output model AI Anda.
  const monthlyPlantingPredictions = [
    {
      month: "September 2025",
      season: "Kemarau",
      rainfall: 80,
      temp: 26,
      recommendations: [
        { plant: "Jagung", suitability: "excellent", reason: "Cuaca kering ideal untuk jagung" },
        { plant: "Kacang Tanah", suitability: "good", reason: "Toleran terhadap kekeringan" },
        { plant: "Ubi Jalar", suitability: "good", reason: "Tahan kekeringan, hasil optimal" },
      ],
    },
    {
      month: "Oktober 2025",
      season: "Peralihan",
      rainfall: 120,
      temp: 27,
      recommendations: [
        { plant: "Cabai", suitability: "excellent", reason: "Cuaca mulai lembab, ideal untuk cabai" },
        { plant: "Tomat", suitability: "good", reason: "Kelembaban cukup untuk pertumbuhan" },
        { plant: "Bayam", suitability: "excellent", reason: "Sayuran hijau tumbuh optimal" },
      ],
    },
    {
      month: "November 2025",
      season: "Peralihan ke Hujan",
      rainfall: 180,
      temp: 26,
      recommendations: [
        { plant: "Padi", suitability: "excellent", reason: "Awal musim hujan, cocok untuk padi" },
        { plant: "Kangkung", suitability: "excellent", reason: "Sayuran air, butuh kelembaban tinggi" },
        { plant: "Kacang Panjang", suitability: "good", reason: "Curah hujan cukup untuk pertumbuhan" },
      ],
    },
  ];
  return monthlyPlantingPredictions;
};

// Fungsi untuk mengkonversi data BMKG per 3 jam menjadi data harian
const convertForecastToWeekly = (forecast: any) => {
    if (!forecast || forecast.length === 0) return { weeklyWeather: [], rainfallData: [] };

    const dailyData: any = {};
    
    // Iterasi melalui setiap hari prakiraan
    forecast.forEach((dayForecast: any) => {
        dayForecast.forEach((prakiraan: any) => {
            const date = prakiraan.local_datetime.split(' ')[0];
            const dayOfWeek = new Date(date).toLocaleDateString('id-ID', { weekday: 'short' });

            if (!dailyData[date]) {
                dailyData[date] = {
                    day: dayOfWeek,
                    date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                    icon: prakiraan.weather_desc, 
                    weather: prakiraan.weather_desc,
                    temp: `${prakiraan.t}°C`,
                    rain: prakiraan.hu, 
                    humidity: prakiraan.hu,
                    plantAdvice: 'good', 
                    maxTemp: prakiraan.t,
                    minTemp: prakiraan.t,
                    rawTemp: prakiraan.t,
                };
            } else {
                dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, prakiraan.t);
                dailyData[date].minTemp = Math.min(dailyData[date].minTemp, prakiraan.t);
                dailyData[date].temp = `${dailyData[date].minTemp}-${dailyData[date].maxTemp}°C`;
            }
        });
    });

    const weeklyWeather = Object.values(dailyData);
    const rainfallData = weeklyWeather.map((item: any) => ({
      day: item.day,
      rainfall: item.rain,
      temp: item.maxTemp,
    }));
  
    return { weeklyWeather, rainfallData };
};


// Fungsi untuk memetakan deskripsi cuaca dari BMKG ke ikon Lucide React
const getIconForWeather = (weatherDesc: string) => {
  if (weatherDesc.includes("Cerah")) return Sun;
  if (weatherDesc.includes("Hujan")) return CloudRain;
  if (weatherDesc.includes("Berawan")) return Cloud;
  return Sun;
};

export function WeatherPrediction() {
  const [selectedLocation, setSelectedLocation] = useState("33.07.01.2001");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      console.log("🔄 Starting to load weather data...");
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`📍 Loading data for location: ${selectedLocation}`);
        const data = await fetchBMKGData(selectedLocation);
        console.log("✅ Weather data received:", data);

        if (data && data.forecast) {
          const { forecast } = data;
          
          // Konversi data prakiraan per 3 jam menjadi data mingguan dan chart
          console.log("🔄 Processing forecast data...");
          const processedData = convertForecastToWeekly(forecast);
          console.log("✅ Processed data:", processedData);
          setWeatherData(processedData);
          
          // Panggil AI dengan data yang sudah diproses
          console.log("🤖 Getting AI recommendations...");
          const recommendations = analyzeWithAI(data);
          console.log("✅ AI recommendations:", recommendations);
          setAiRecommendations(recommendations);
        } else {
          console.warn("⚠️ No forecast data received");
          setWeatherData(null);
          setAiRecommendations(null);
          setError("Data cuaca tidak tersedia");
        }
      } catch (err) {
        console.error("❌ Error loading weather data:", err);
        setError("Gagal memuat data cuaca");
        setWeatherData(null);
        setAiRecommendations(null);
      } finally {
        setIsLoading(false);
        console.log("🏁 Weather data loading finished");
      }
    };
    
    loadData();
  }, [selectedLocation]);

  // Fungsi utilitas lainnya (getSuitabilityColor, dll) tetap sama
  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "caution":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSuitabilityText = (suitability: string) => {
    switch (suitability) {
      case "excellent":
        return "Sangat Cocok";
      case "good":
        return "Cocok";
      case "caution":
        return "Hati-hati";
      default:
        return "";
    }
  };

  const downloadPlantingGuide = () => {
    if (!aiRecommendations) return;
    
    const content = aiRecommendations
      .map(
        (month: any) =>
          `${month.month} (${month.season})\n` +
          `Curah Hujan: ${month.rainfall}mm | Suhu: ${month.temp}°C\n` +
          `Rekomendasi Tanaman:\n` +
          month.recommendations
            .map(
              (rec: any) =>
                `- ${rec.plant}: ${getSuitabilityText(rec.suitability)} (${
                  rec.reason
                })`
            )
            .join("\n") +
          "\n\n"
      )
      .join("");

    const blob = new Blob([`Panduan Tanam EcoScope Wonosobo\n\n${content}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `panduan-tanam-${selectedLocation}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const getPlantAdviceColor = (advice: string) => {
    switch (advice) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "caution":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "avoid":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPlantAdviceText = (advice: string) => {
    switch (advice) {
      case "excellent":
        return "Sangat Baik";
      case "good":
        return "Baik";
      case "caution":
        return "Hati-hati";
      case "avoid":
        return "Hindari";
      default:
        return "";
    }
  };

  const getPlantAdviceIcon = (advice: string) => {
    switch (advice) {
      case "excellent":
        return <Sprout className="h-3 w-3 text-green-600" />;
      case "good":
        return <Sprout className="h-3 w-3 text-blue-600" />;
      case "caution":
        return <Sprout className="h-3 w-3 text-yellow-600" />;
      case "avoid":
        return <Sprout className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-8xl mx-auto flex justify-center items-center h-screen">
        <div className="text-center">
          <Cloud className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground mb-2">
            Memuat data cuaca BMKG...
          </p>
          <p className="text-sm text-muted-foreground">
            {BACKEND_AVAILABLE ? 
              "Mengambil data realtime..." : 
              "Memuat data simulasi..."
            }
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-8xl mx-auto flex justify-center items-center h-screen">
        <div className="text-center">
          <CloudRain className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-2">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!weatherData || !aiRecommendations) {
    return (
      <div className="p-6 max-w-8xl mx-auto flex justify-center items-center h-screen">
        <div className="text-center">
          <CloudRain className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-muted-foreground mb-2">
            Data cuaca tidak tersedia
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Gagal memuat data cuaca. Silakan pilih lokasi lain atau coba lagi nanti.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Prediksi Cuaca</h1>
            <p className="text-muted-foreground">
              Prakiraan cuaca dan saran waktu tanam dari BMKG
            </p>
            {!BACKEND_AVAILABLE && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                Mode Demo: Data simulasi
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Pilih Lokasi:</span>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="33.07.01.2001">Desa Kaligowong</SelectItem>
                  <SelectItem value="33.07.01.2002">Desa Sumbersari</SelectItem>
                  <SelectItem value="33.07.01.2003">Desa Sumberejo</SelectItem>
                  <SelectItem value="33.07.01.2004">Desa Erorejo</SelectItem>
                  <SelectItem value="33.07.01.2005">Desa Karanganyar</SelectItem>
                  <SelectItem value="33.07.01.2006">Desa Panerusan</SelectItem>
                  <SelectItem value="33.07.01.1007">Kelurahan Wadaslintang</SelectItem>
                  <SelectItem value="33.07.01.2008">Desa Plunjaran</SelectItem>
                  <SelectItem value="33.07.01.2009">Desa Kumejing</SelectItem>
                  <SelectItem value="33.07.01.2010">Desa Lancar</SelectItem>
                  <SelectItem value="33.07.01.2011">Desa Somogede</SelectItem>
                  <SelectItem value="33.07.01.2012">Desa Trimulyo</SelectItem>
                  <SelectItem value="33.07.01.2013">Desa Tirip</SelectItem>
                  <SelectItem value="33.07.01.2014">Desa Besuki</SelectItem>
                  <SelectItem value="33.07.01.2015">Desa Gumelar</SelectItem>
                  <SelectItem value="33.07.01.2016">Desa Ngalian</SelectItem>
                  <SelectItem value="33.07.01.2017">Desa Kalidadap</SelectItem>
                  <SelectItem value="33.07.02.2001">Desa Gondowulan</SelectItem>
                  <SelectItem value="33.07.02.2002">Desa Jangkrikan</SelectItem>
                  <SelectItem value="33.07.02.2003">Desa Tegeswetan</SelectItem>
                  <SelectItem value="33.07.02.2004">Desa Gadingsukuh</SelectItem>
                  <SelectItem value="33.07.02.2005">Desa Burat</SelectItem>
                  <SelectItem value="33.07.02.2006">Desa Bener</SelectItem>
                  <SelectItem value="33.07.02.2007">Desa Gadingrejo</SelectItem>
                  <SelectItem value="33.07.02.1008">Kelurahan Kepil</SelectItem>
                  <SelectItem value="33.07.02.2009">Desa Beran</SelectItem>
                  <SelectItem value="33.07.02.2010">Desa Kapulogo</SelectItem>
                  <SelectItem value="33.07.02.2011">Desa Kagungan</SelectItem>
                  <SelectItem value="33.07.02.2012">Desa Randusari</SelectItem>
                  <SelectItem value="33.07.02.2013">Desa Rejosari</SelectItem>
                  <SelectItem value="33.07.02.2014">Desa Ngalian</SelectItem>
                  <SelectItem value="33.07.02.2015">Desa Kalipuru</SelectItem>
                  <SelectItem value="33.07.02.2016">Desa Tanjunganom</SelectItem>
                  <SelectItem value="33.07.02.2017">Desa Kaliwuluh</SelectItem>
                  <SelectItem value="33.07.02.2018">Desa Tegalgot</SelectItem>
                  <SelectItem value="33.07.02.2019">Desa Warangan</SelectItem>
                  <SelectItem value="33.07.02.2020">Desa Ropoh</SelectItem>
                  <SelectItem value="33.07.02.2021">Desa Pulosaren</SelectItem>
                  <SelectItem value="33.07.03.2001">Desa Bogoran</SelectItem>
                  <SelectItem value="33.07.03.2002">Desa Karangsari</SelectItem>
                  <SelectItem value="33.07.03.2003">Desa Pecekelan</SelectItem>
                  <SelectItem value="33.07.03.2004">Desa Glagah</SelectItem>
                  <SelectItem value="33.07.03.2005">Desa Surojoyo</SelectItem>
                  <SelectItem value="33.07.03.2006">Desa Talunombo</SelectItem>
                  <SelectItem value="33.07.03.2007">Desa Tempursari</SelectItem>
                  <SelectItem value="33.07.03.1008">Kelurahan Sapuran</SelectItem>
                  <SelectItem value="33.07.03.2009">Desa Jolontoro</SelectItem>
                  <SelectItem value="33.07.03.2010">Desa Sedayu</SelectItem>
                  <SelectItem value="33.07.03.2011">Desa Ngadisalam</SelectItem>
                  <SelectItem value="33.07.03.2012">Desa Tempuranduwur</SelectItem>
                  <SelectItem value="33.07.03.2013">Desa Marongsari</SelectItem>
                  <SelectItem value="33.07.03.2014">Desa Batursari</SelectItem>
                  <SelectItem value="33.07.03.2015">Desa Banyumudal</SelectItem>
                  <SelectItem value="33.07.03.2016">Desa Ngadikerso</SelectItem>
                  <SelectItem value="33.07.03.2017">Desa Rimpak</SelectItem>
                  <SelectItem value="33.07.04.2001">Desa Selomanik</SelectItem>
                  <SelectItem value="33.07.04.2002">Desa Bendungan</SelectItem>
                  <SelectItem value="33.07.04.2003">Desa Medono</SelectItem>
                  <SelectItem value="33.07.04.2004">Desa Ngadisono</SelectItem>
                  <SelectItem value="33.07.04.2005">Desa Lebak</SelectItem>
                  <SelectItem value="33.07.04.2006">Desa Ngasinan</SelectItem>
                  <SelectItem value="33.07.04.2007">Desa Kaliguwo</SelectItem>
                  <SelectItem value="33.07.04.2008">Desa Pesodongan</SelectItem>
                  <SelectItem value="33.07.04.2009">Desa Lamuk</SelectItem>
                  <SelectItem value="33.07.04.2010">Desa Pucungkerep</SelectItem>
                  <SelectItem value="33.07.04.2011">Desa Gambaran</SelectItem>
                  <SelectItem value="33.07.04.2012">Desa Purwosari</SelectItem>
                  <SelectItem value="33.07.04.2013">Desa Grugu</SelectItem>
                  <SelectItem value="33.07.04.2014">Desa Tracap</SelectItem>
                  <SelectItem value="33.07.04.1015">Kelurahan Kaliwiro</SelectItem>
                  <SelectItem value="33.07.04.2016">Desa Kauman</SelectItem>
                  <SelectItem value="33.07.04.2017">Desa Cledok</SelectItem>
                  <SelectItem value="33.07.04.2018">Desa Winongsari</SelectItem>
                  <SelectItem value="33.07.04.2019">Desa Sukoreno</SelectItem>
                  <SelectItem value="33.07.04.2020">Desa Kemiriombo</SelectItem>
                  <SelectItem value="33.07.04.2021">Desa Tanjunganom</SelectItem>
                  <SelectItem value="33.07.05.2001">Desa Sawangan</SelectItem>
                  <SelectItem value="33.07.05.2002">Desa Lipursari</SelectItem>
                  <SelectItem value="33.07.05.2003">Desa Selokromo</SelectItem>
                  <SelectItem value="33.07.05.2004">Desa Sojokerto</SelectItem>
                  <SelectItem value="33.07.05.2005">Desa Besani</SelectItem>
                  <SelectItem value="33.07.05.1006">Kelurahan Leksono</SelectItem>
                  <SelectItem value="33.07.05.2007">Desa Jlamprang</SelectItem>
                  <SelectItem value="33.07.05.2008">Desa Wonokerto</SelectItem>
                  <SelectItem value="33.07.05.2009">Desa Jonggolsari</SelectItem>
                  <SelectItem value="33.07.05.2010">Desa Kalimendong</SelectItem>
                  <SelectItem value="33.07.05.2011">Desa Timbang</SelectItem>
                  <SelectItem value="33.07.05.2012">Desa Pacarmulyo</SelectItem>
                  <SelectItem value="33.07.05.2013">Desa Durensawit</SelectItem>
                  <SelectItem value="33.07.05.2014">Desa Manggis</SelectItem>
                  <SelectItem value="33.07.06.2001">Desa Kecis</SelectItem>
                  <SelectItem value="33.07.06.2002">Desa Kaliputih</SelectItem>
                  <SelectItem value="33.07.06.2003">Desa Candi</SelectItem>
                  <SelectItem value="33.07.06.2004">Desa Balekambang</SelectItem>
                  <SelectItem value="33.07.06.2005">Desa Karangrejo</SelectItem>
                  <SelectItem value="33.07.06.2006">Desa Krasak</SelectItem>
                  <SelectItem value="33.07.06.2007">Desa Gunungtawang</SelectItem>
                  <SelectItem value="33.07.06.1008">Kelurahan Selomerto</SelectItem>
                  <SelectItem value="33.07.06.2009">Desa Pakuncen</SelectItem>
                  <SelectItem value="33.07.06.2010">Desa Kalierang</SelectItem>
                  <SelectItem value="33.07.06.1011">Kelurahan Wonorejo</SelectItem>
                  <SelectItem value="33.07.06.2012">Desa Wilayu</SelectItem>
                  <SelectItem value="33.07.06.2013">Desa Sinduagung</SelectItem>
                  <SelectItem value="33.07.06.2014">Desa Sumberwulan</SelectItem>
                  <SelectItem value="33.07.06.2015">Desa Plobangan</SelectItem>
                  <SelectItem value="33.07.06.2016">Desa Simbarejo</SelectItem>
                  <SelectItem value="33.07.06.2017">Desa Wulungsari</SelectItem>
                  <SelectItem value="33.07.06.2018">Desa Bumitirto</SelectItem>
                  <SelectItem value="33.07.06.2019">Desa Semayu</SelectItem>
                  <SelectItem value="33.07.06.2020">Desa Adiwarno</SelectItem>
                  <SelectItem value="33.07.06.2021">Desa Kadipaten</SelectItem>
                  <SelectItem value="33.07.06.2022">Desa Sidorejo</SelectItem>
                  <SelectItem value="33.07.06.2023">Desa Tumenggungan</SelectItem>
                  <SelectItem value="33.07.06.2024">Desa Ngadimulyo</SelectItem>
                  <SelectItem value="33.07.07.2001">Desa Mangunrejo</SelectItem>
                  <SelectItem value="33.07.07.2002">Desa Mungkung</SelectItem>
                  <SelectItem value="33.07.07.2003">Desa Perboto</SelectItem>
                  <SelectItem value="33.07.07.2004">Desa Kedalon</SelectItem>
                  <SelectItem value="33.07.07.2005">Desa Rejosari</SelectItem>
                  <SelectItem value="33.07.07.1006">Kelurahan Kalikajar</SelectItem>
                  <SelectItem value="33.07.07.2007">Desa Simbang</SelectItem>
                  <SelectItem value="33.07.07.2008">Desa Karangduwur</SelectItem>
                  <SelectItem value="33.07.07.2009">Desa Kwadungan</SelectItem>
                  <SelectItem value="33.07.07.2010">Desa Purwojiwo</SelectItem>
                  <SelectItem value="33.07.07.2011">Desa Wonosari</SelectItem>
                  <SelectItem value="33.07.07.2012">Desa Kalikuning</SelectItem>
                  <SelectItem value="33.07.07.2013">Desa Maduretno</SelectItem>
                  <SelectItem value="33.07.07.2014">Desa Tegalombo</SelectItem>
                  <SelectItem value="33.07.07.2015">Desa Kembaran</SelectItem>
                  <SelectItem value="33.07.07.2016">Desa Lamuk</SelectItem>
                  <SelectItem value="33.07.07.2017">Desa Bowongso</SelectItem>
                  <SelectItem value="33.07.07.2018">Desa Butuh</SelectItem>
                  <SelectItem value="33.07.07.2019">Desa Butuh Kidul</SelectItem>
                  <SelectItem value="33.07.08.1001">Kelurahan Wringinanom</SelectItem>
                  <SelectItem value="33.07.08.2002">Desa Sudungdewo</SelectItem>
                  <SelectItem value="33.07.08.2003">Desa Bejiarum</SelectItem>
                  <SelectItem value="33.07.08.2004">Desa Ngadikusuman</SelectItem>
                  <SelectItem value="33.07.08.2005">Desa Bojasari</SelectItem>
                  <SelectItem value="33.07.08.2006">Desa Surengede</SelectItem>
                  <SelectItem value="33.07.08.2007">Desa Sindupaten</SelectItem>
                  <SelectItem value="33.07.08.1008">Kelurahan Kertek</SelectItem>
                  <SelectItem value="33.07.08.2009">Desa Sumberdalem</SelectItem>
                  <SelectItem value="33.07.08.2010">Desa Purwojati</SelectItem>
                  <SelectItem value="33.07.08.2011">Desa Karangluhur</SelectItem>
                  <SelectItem value="33.07.08.2012">Desa Tlogodalem</SelectItem>
                  <SelectItem value="33.07.08.2013">Desa Banjar</SelectItem>
                  <SelectItem value="33.07.08.2014">Desa Damarkasiyan</SelectItem>
                  <SelectItem value="33.07.08.2015">Desa Tlogomulyo</SelectItem>
                  <SelectItem value="33.07.08.2016">Desa Pagerejo</SelectItem>
                  <SelectItem value="33.07.08.2017">Desa Candimulyo</SelectItem>
                  <SelectItem value="33.07.08.2018">Desa Purbosono</SelectItem>
                  <SelectItem value="33.07.08.2019">Desa Candiyasan</SelectItem>
                  <SelectItem value="33.07.08.2020">Desa Kapencar</SelectItem>
                  <SelectItem value="33.07.08.2021">Desa Reco</SelectItem>
                  <SelectItem value="33.07.09.2001">Desa Wonolelo</SelectItem>
                  <SelectItem value="33.07.09.1002">Kelurahan Tawangsari</SelectItem>
                  <SelectItem value="33.07.09.1003">Kelurahan Mlipak</SelectItem>
                  <SelectItem value="33.07.09.1004">Kelurahan Jaraksari</SelectItem>
                  <SelectItem value="33.07.09.2005">Desa Jogoyitnan</SelectItem>
                  <SelectItem value="33.07.09.1006">Kelurahan Kramatan</SelectItem>
                  <SelectItem value="33.07.09.2007">Desa Pancurwening</SelectItem>
                  <SelectItem value="33.07.09.1008">Kelurahan Bumiroso</SelectItem>
                  <SelectItem value="33.07.09.1009">Kelurahan Rojoimo</SelectItem>
                  <SelectItem value="33.07.09.1010">Kelurahan Pagerkukuh</SelectItem>
                  <SelectItem value="33.07.09.1011">Kelurahan Sambek</SelectItem>
                  <SelectItem value="33.07.09.1013">Kelurahan Kejiwan</SelectItem>
                  <SelectItem value="33.07.09.1014">Kelurahan Kalianget</SelectItem>
                  <SelectItem value="33.07.09.1015">Kelurahan Jlamprang</SelectItem>
                  <SelectItem value="33.07.09.2016">Desa Wonosari</SelectItem>
                  <SelectItem value="33.07.09.2017">Desa Bomerto</SelectItem>
                  <SelectItem value="33.07.09.2018">Desa Sariyoso</SelectItem>
                  <SelectItem value="33.07.09.2019">Desa Tlogojati</SelectItem>
                  <SelectItem value="33.07.09.1020">Kelurahan Wonosobo Barat</SelectItem>
                  <SelectItem value="33.07.09.1021">Kelurahan Wonosobo Timur</SelectItem>
                  <SelectItem value="33.07.10.2001">Desa Bumiroso</SelectItem>
                  <SelectItem value="33.07.10.2002">Desa Gondang</SelectItem>
                  <SelectItem value="33.07.10.2003">Desa Limbangan</SelectItem>
                  <SelectItem value="33.07.10.2004">Desa Kuripan</SelectItem>
                  <SelectItem value="33.07.10.2005">Desa Banyukembar</SelectItem>
                  <SelectItem value="33.07.10.2006">Desa Gumawangkidul</SelectItem>
                  <SelectItem value="33.07.10.2007">Desa Wonosroyo</SelectItem>
                  <SelectItem value="33.07.10.2008">Desa Watumalang</SelectItem>
                  <SelectItem value="33.07.10.2009">Desa Pasuruhan</SelectItem>
                  <SelectItem value="33.07.10.1010">Kelurahan Wonoroto</SelectItem>
                  <SelectItem value="33.07.10.2011">Desa Lumajang</SelectItem>
                  <SelectItem value="33.07.10.2012">Desa Binangun</SelectItem>
                  <SelectItem value="33.07.10.2013">Desa Wonokampir</SelectItem>
                  <SelectItem value="33.07.10.2014">Desa Krinjing</SelectItem>
                  <SelectItem value="33.07.10.2015">Desa Mutisari</SelectItem>
                  <SelectItem value="33.07.10.2016">Desa Kalidesel</SelectItem>
                  <SelectItem value="33.07.11.2001">Desa Sojopuro</SelectItem>
                  <SelectItem value="33.07.11.2002">Desa Candirejo</SelectItem>
                  <SelectItem value="33.07.11.2003">Desa Keseneng</SelectItem>
                  <SelectItem value="33.07.11.1004">Kelurahan Mudal</SelectItem>
                  <SelectItem value="33.07.11.1005">Kelurahan Andongsili</SelectItem>
                  <SelectItem value="33.07.11.2006">Desa Krasak</SelectItem>
                  <SelectItem value="33.07.11.2007">Desa Bumirejo</SelectItem>
                  <SelectItem value="33.07.11.2008">Desa Blederan</SelectItem>
                  <SelectItem value="33.07.11.1009">Kelurahan Kalibeber</SelectItem>
                  <SelectItem value="33.07.11.2010">Desa Sukorejo</SelectItem>
                  <SelectItem value="33.07.11.2011">Desa Larangankulon</SelectItem>
                  <SelectItem value="33.07.11.2012">Desa Pungangan</SelectItem>
                  <SelectItem value="33.07.11.2013">Desa Gunturmadu</SelectItem>
                  <SelectItem value="33.07.11.2014">Desa Mojosari</SelectItem>
                  <SelectItem value="33.07.11.2015">Desa Wonokromo</SelectItem>
                  <SelectItem value="33.07.11.2016">Desa Derongisor</SelectItem>
                  <SelectItem value="33.07.11.2017">Desa Deroduwur</SelectItem>
                  <SelectItem value="33.07.11.2018">Desa Slukatan</SelectItem>
                  <SelectItem value="33.07.11.2019">Desa Kebrengan</SelectItem>
                  <SelectItem value="33.07.12.2001">Desa Lengkong</SelectItem>
                  <SelectItem value="33.07.12.2002">Desa Gemblengan</SelectItem>
                  <SelectItem value="33.07.12.2003">Desa Sendangsari</SelectItem>
                  <SelectItem value="33.07.12.2004">Desa Kayugiyang</SelectItem>
                  <SelectItem value="33.07.12.1005">Kelurahan Garung</SelectItem>
                  <SelectItem value="33.07.12.2006">Desa Siwuran</SelectItem>
                  <SelectItem value="33.07.12.2007">Desa Kuripan</SelectItem>
                  <SelectItem value="33.07.12.2008">Desa Jengkol</SelectItem>
                  <SelectItem value="33.07.12.2009">Desa Tlogo</SelectItem>
                  <SelectItem value="33.07.12.2010">Desa Maron</SelectItem>
                  <SelectItem value="33.07.12.2011">Desa Menjer</SelectItem>
                  <SelectItem value="33.07.12.2012">Desa Mlandi</SelectItem>
                  <SelectItem value="33.07.12.2013">Desa Laranganlor</SelectItem>
                  <SelectItem value="33.07.12.2014">Desa Sitiharjo</SelectItem>
                  <SelectItem value="33.07.12.2015">Desa Tegalsari</SelectItem>
                  <SelectItem value="33.07.13.2001">Desa Campursari</SelectItem>
                  <SelectItem value="33.07.13.2002">Desa Sikunang</SelectItem>
                  <SelectItem value="33.07.13.2003">Desa Sembungan</SelectItem>
                  <SelectItem value="33.07.13.2004">Desa Kreo</SelectItem>
                  <SelectItem value="33.07.13.2005">Desa Tambi</SelectItem>
                  <SelectItem value="33.07.13.2006">Desa Buntu</SelectItem>
                  <SelectItem value="33.07.13.2007">Desa Sigedang</SelectItem>
                  <SelectItem value="33.07.13.1008">Kelurahan Kejajar</SelectItem>
                  <SelectItem value="33.07.13.2009">Desa Serang</SelectItem>
                  <SelectItem value="33.07.13.2010">Desa Tieng</SelectItem>
                  <SelectItem value="33.07.13.2011">Desa Parikesit</SelectItem>
                  <SelectItem value="33.07.13.2012">Desa Jojogan</SelectItem>
                  <SelectItem value="33.07.13.2013">Desa Dieng</SelectItem>
                  <SelectItem value="33.07.13.2014">Desa Patakbanteng</SelectItem>
                  <SelectItem value="33.07.13.2015">Desa Surengede</SelectItem>
                  <SelectItem value="33.07.13.2016">Desa Igirmranak</SelectItem>
                  <SelectItem value="33.07.14.2001">Desa Kupangan</SelectItem>
                  <SelectItem value="33.07.14.2002">Desa Mergosari</SelectItem>
                  <SelectItem value="33.07.14.2003">Desa Sukoharjo</SelectItem>
                  <SelectItem value="33.07.14.2004">Desa Rogojati</SelectItem>
                  <SelectItem value="33.07.14.2005">Desa Karanganyar</SelectItem>
                  <SelectItem value="33.07.14.2006">Desa Sempol</SelectItem>
                  <SelectItem value="33.07.14.2007">Desa Plodongan</SelectItem>
                  <SelectItem value="33.07.14.2008">Desa Suroyudan</SelectItem>
                  <SelectItem value="33.07.14.2009">Desa Gumiwang</SelectItem>
                  <SelectItem value="33.07.14.2010">Desa Gunungtugel</SelectItem>
                  <SelectItem value="33.07.14.2011">Desa Pulus</SelectItem>
                  <SelectItem value="33.07.14.2012">Desa Pucungwetan</SelectItem>
                  <SelectItem value="33.07.14.2013">Desa Kajeksan</SelectItem>
                  <SelectItem value="33.07.14.2014">Desa Tlogo</SelectItem>
                  <SelectItem value="33.07.14.2015">Desa Kalibening</SelectItem>
                  <SelectItem value="33.07.14.2016">Desa Garunglor</SelectItem>
                  <SelectItem value="33.07.14.2017">Desa Jebengplampitan</SelectItem>
                  <SelectItem value="33.07.15.2001">Desa Pengarengan</SelectItem>
                  <SelectItem value="33.07.15.2002">Desa Kalikarung</SelectItem>
                  <SelectItem value="33.07.15.2003">Desa Dempel</SelectItem>
                  <SelectItem value="33.07.15.2004">Desa Karangsambung</SelectItem>
                  <SelectItem value="33.07.15.2005">Desa Tempurejo</SelectItem>
                  <SelectItem value="33.07.15.2006">Desa Mergolangu</SelectItem>
                  <SelectItem value="33.07.15.2007">Desa Depok</SelectItem>
                  <SelectItem value="33.07.15.2008">Desa Kalialang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekly">Prakiraan 3 Harian</TabsTrigger>
          <TabsTrigger value="monthly">Prediksi Bulanan</TabsTrigger>
          <TabsTrigger value="charts">Grafik Detail</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          {/* Tampilan ini akan menggunakan data yang sudah diproses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
            {weatherData.weeklyWeather.map((day: any, index: number) => {
              const Icon = getIconForWeather(day.weather);
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium">{day.day}</h3>
                        <p className="text-xs text-muted-foreground">
                          {day.date}
                        </p>
                      </div>
                      <Icon className="h-8 w-8 mx-auto text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{day.weather}</p>
                        <p className="text-xs text-muted-foreground">
                          {day.temp}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-1">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          <span className="text-xs">{day.rain}mm</span>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs border flex items-center justify-center space-x-1 ${getPlantAdviceColor(
                            day.plantAdvice
                          )}`}
                        >
                          {getPlantAdviceIcon(day.plantAdvice)}
                          <span>{getPlantAdviceText(day.plantAdvice)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Thermometer className="h-5 w-5 mr-2" /> Detail Cuaca Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm text-muted-foreground">Suhu</p>
                  <p className="font-medium">
                    {weatherData.weeklyWeather[0].temp}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Kelembaban</p>
                  <p className="font-medium">
                    {weatherData.weeklyWeather[0].humidity}%
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <CloudRain className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
                  <p className="text-sm text-muted-foreground">Curah Hujan</p>
                  <p className="font-medium">
                    {weatherData.weeklyWeather[0].rain} mm
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <Sprout className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">Saran Tanam</p>
                  <Badge className="bg-green-100 text-green-800">Baik</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Prediksi Tanaman 6 Bulan Ke Depan
                </h2>
                <p className="text-muted-foreground">
                  Rekomendasi tanaman berdasarkan prediksi iklim
                </p>
              </div>
              <Button
                onClick={downloadPlantingGuide}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Panduan</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiRecommendations.map((month: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        {month.month}
                      </div>
                      <Badge variant="outline">{month.season}</Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 mr-1" />
                        {month.rainfall}mm
                      </div>
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 mr-1" />
                        {month.temp}°C
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {month.recommendations.map(
                        (rec: any, recIndex: number) => (
                          <div key={recIndex} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{rec.plant}</h4>
                              <Badge
                                className={getSuitabilityColor(rec.suitability)}
                              >
                                {getSuitabilityText(rec.suitability)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {rec.reason}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Curah Hujan Mingguan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weatherData.rainfallData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} mm`, "Curah Hujan"]}
                    />
                    <Bar dataKey="rainfall" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tren Suhu Mingguan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weatherData.rainfallData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}°C`, "Suhu"]} />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Cuaca 6 Bulan Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Data riwayat tidak tersedia dari API prakiraan BMKG.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}