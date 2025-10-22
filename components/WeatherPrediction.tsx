import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
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
  Zap,
  Thermometer,
  Droplets,
  Sprout,
  Calendar,
  Wind,
  Eye,
  MapPin,
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
import { fetchWeatherPredictions } from "../src/services/weatherApi";
import {
  fetchBMKGDirect,
  groupForecastsByDay,
  getAverageTemp,
  getTotalRainfall,
  getDominantWeather,
  type ParsedBMKGData,
} from "../src/services/bmkgApi";

const fetchBMKGData = async (adm4Code: string) => {
  const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4Code}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const rawData = await response.json();
    const locationData = rawData?.lokasi;
    const forecastData = rawData?.data?.[0]?.cuaca;
    if (!locationData || !forecastData) {
      throw new Error("Struktur data dari BMKG API tidak valid.");
    }
    return { location: locationData, forecast: forecastData };
  } catch (error) {
    console.error("Gagal mengambil data dari BMKG API:", error);
    return null;
  }
};

// Fetch ML predictions from backend
const fetchBackendPredictions = async (days: number = 3) => {
  return await fetchWeatherPredictions(days);
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
  const [backendPredictions, setBackendPredictions] = useState<any>(null);
  const [threeDayPredictions, setThreeDayPredictions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bmkgDetailData, setBmkgDetailData] = useState<ParsedBMKGData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Fetch BMKG data (real-time forecast) - sebagai fallback
      const data = await fetchBMKGData(selectedLocation);
      
      // Fetch BMKG detail data untuk tab prakiraan
      const bmkgDetail = await fetchBMKGDirect(selectedLocation);
      setBmkgDetailData(bmkgDetail);

      if (data) {
        const { forecast } = data;
        
        // Konversi data prakiraan per 3 jam menjadi data mingguan dan chart
        const processedData = convertForecastToWeekly(forecast);
        setWeatherData(processedData);
      } else {
        setWeatherData(null);
      }

      // Fetch 3-day predictions for "Prakiraan 3 Harian" tab
      const predictions3Day = await fetchBackendPredictions(3);
      if (predictions3Day && predictions3Day.length > 0) {
        // Convert prediction data to display format
        const processedPredictions = predictions3Day.map((item: any) => {
          const itemDate = new Date(item.date);
          const avgTemp = item.predicted_temp;
          return {
            day: itemDate.toLocaleDateString("id-ID", { weekday: "short" }),
            date: itemDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
            fullDate: item.date,
            temperature: avgTemp,
            predicted_temp: item.predicted_temp,
            lower_bound: item.lower_bound,
            upper_bound: item.upper_bound,
            source: item.source,
            temp: `${avgTemp?.toFixed(0)}°C`,
            tempRange: `${item.lower_bound?.toFixed(0)}-${item.upper_bound?.toFixed(0)}°C`,
            weather: avgTemp > 30 ? "Panas" : avgTemp > 27 ? "Cerah" : avgTemp > 24 ? "Sejuk" : "Dingin",
            plantAdvice: avgTemp > 30 ? "caution" : avgTemp > 27 ? "good" : "excellent",
          };
        });
        setThreeDayPredictions(processedPredictions);
      }

      // Fetch 7-day ML predictions for "Prediksi AI/ML" tab
      const predictions = await fetchBackendPredictions(7);
      setBackendPredictions(predictions);
      
      setIsLoading(false);
    };
    loadData();
  }, [selectedLocation]);

  // Fungsi utilitas untuk plant advice
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
        <p className="text-muted-foreground">
          Memuat data cuaca dan rekomendasi...
        </p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="p-6 max-w-8xl mx-auto flex justify-center items-center h-screen">
        <p className="text-destructive-foreground">
          Gagal memuat data cuaca. Silakan pilih lokasi lain atau coba lagi
          nanti.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Prediksi Cuaca</h1>
            <p className="text-muted-foreground">
              Prakiraan cuaca dan saran waktu tanam dari BMKG
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {backendPredictions && backendPredictions.length > 0 ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                ML Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-600">
                ML Offline
              </Badge>
            )}
          </div>
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
          <TabsTrigger value="weekly">Prakiraan Cuaca BMKG</TabsTrigger>
          <TabsTrigger value="ml-prediction">Prediksi AI/ML</TabsTrigger>
          <TabsTrigger value="monthly">Prediksi Bulanan</TabsTrigger>
          <TabsTrigger value="charts">Grafik Detail</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
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
                          {bmkgDetailData.location.desa}, {bmkgDetailData.location.kecamatan}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bmkgDetailData.location.kotkab}, {bmkgDetailData.location.provinsi}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 Koordinat: {bmkgDetailData.location.lat}, {bmkgDetailData.location.lon}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      <Cloud className="h-3 w-3 mr-1" />
                      Data BMKG
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prakiraan 7 Hari dari BMKG */}
            {bmkgDetailData && bmkgDetailData.forecasts.length > 0 ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Prakiraan 7 Hari</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {(() => {
                      const groupedForecasts = groupForecastsByDay(bmkgDetailData.forecasts);
                      const days = Object.keys(groupedForecasts).slice(0, 7);
                      const cards = [];
                      
                      // Render data yang tersedia dari BMKG
                      days.forEach((day, index) => {
                        const dayForecasts = groupedForecasts[day];
                        const avgTemp = getAverageTemp(dayForecasts);
                        const totalRain = getTotalRainfall(dayForecasts);
                        const dominantWeather = getDominantWeather(dayForecasts);
                        const firstForecast = dayForecasts[0];

                        cards.push(
                          <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold">{day}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      Hari ke-{index + 1}
                                    </p>
                                  </div>
                                  <Badge variant="outline">{dayForecasts.length}x</Badge>
                                </div>

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

                                <div className="text-center">
                                  <p className="text-sm font-medium">{dominantWeather}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {firstForecast.weather_desc}
                                  </p>
                                </div>

                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Thermometer className="h-5 w-5 text-orange-500" />
                                    <span className="text-2xl font-bold">{avgTemp}°C</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Rata-rata harian
                                  </p>
                                </div>

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
                      });

                      // Tambahkan placeholder card untuk hari yang tidak tersedia (hingga total 7 card)
                      const remainingDays = 7 - days.length;
                      for (let i = 0; i < remainingDays; i++) {
                        const dayIndex = days.length + i;
                        const futureDate = new Date();
                        futureDate.setDate(futureDate.getDate() + dayIndex);
                        const futureDayName = futureDate.toLocaleDateString("id-ID", { weekday: "long" });
                        
                        cards.push(
                          <Card key={`placeholder-${i}`} className="bg-slate-50 border-dashed opacity-60">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold text-muted-foreground">{futureDayName}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      Hari ke-{dayIndex + 1}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="bg-slate-200">N/A</Badge>
                                </div>

                                <div className="flex justify-center">
                                  <Cloud className="h-16 w-16 text-slate-300" />
                                </div>

                                <div className="text-center">
                                  <p className="text-sm font-medium text-muted-foreground">Data Tidak Tersedia</p>
                                  <p className="text-xs text-muted-foreground">
                                    Belum ada prakiraan
                                  </p>
                                </div>

                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Thermometer className="h-5 w-5 text-slate-300" />
                                    <span className="text-2xl font-bold text-slate-300">--°C</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Tidak tersedia
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dashed">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Droplets className="h-4 w-4 text-slate-300" />
                                      <span className="text-sm font-medium text-slate-400">--mm</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Hujan</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Wind className="h-4 w-4 text-slate-300" />
                                      <span className="text-sm font-medium text-slate-400">--km/j</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Angin</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }

                      return cards;
                    })()}
                  </div>
                </div>

                {/* Detail Per Jam untuk Hari Pertama */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Detail Prakiraan Per Jam - Hari Pertama
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(() => {
                        const groupedForecasts = groupForecastsByDay(bmkgDetailData.forecasts);
                        const days = Object.keys(groupedForecasts);
                        if (days.length === 0) return null;
                        
                        return groupedForecasts[days[0]].map((forecast, index) => (
                          <div
                            key={index}
                            className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors gap-3"
                          >
                            <div className="md:w-32">
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
                              <span className="text-sm font-medium">{forecast.weather_desc}</span>
                            </div>

                            <div className="grid grid-cols-2 md:flex md:gap-4 gap-2">
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
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>

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
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Cloud className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Memuat data prakiraan BMKG...</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Fallback: Tampilan prediksi 3 hari dari backend ML jika BMKG tidak tersedia */}
          {!bmkgDetailData && threeDayPredictions && threeDayPredictions.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <Zap className="h-3 w-3 mr-1" />
                  Fallback: Prediksi dari Backend ML
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Model: {threeDayPredictions[0]?.source}
                </span>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {threeDayPredictions && threeDayPredictions.length > 0 ? (
              threeDayPredictions.map((day: any, index: number) => {
                const Icon = getIconForWeather(day.weather);
                return (
                  <Card key={index} className="text-center border-2">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium">{day.day}</h3>
                          <p className="text-xs text-muted-foreground">
                            {day.date}
                          </p>
                        </div>
                        <Icon className="h-10 w-10 mx-auto text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{day.weather}</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {day.temp}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Rentang: {day.tempRange}
                          </p>
                        </div>
                        <div className="space-y-2">
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
              })
            ) : weatherData && weatherData.weeklyWeather ? (
              // Fallback to BMKG data if backend predictions not available
              <>
                <div className="col-span-full mb-2">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    <Cloud className="h-3 w-3 mr-1" />
                    Menggunakan data BMKG (Backend tidak tersedia)
                  </Badge>
                </div>
                {weatherData.weeklyWeather.slice(0, 7).map((day: any, index: number) => {
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
              </>
            ) : (
              <div className="col-span-full text-center py-8">
                <Cloud className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Data prediksi tidak tersedia</p>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Thermometer className="h-5 w-5 mr-2" /> Detail Prediksi Hari Pertama
              </CardTitle>
            </CardHeader>
            <CardContent>
              {threeDayPredictions && threeDayPredictions.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-muted-foreground">Suhu Prediksi</p>
                    <p className="font-medium">
                      {threeDayPredictions[0].predicted_temp?.toFixed(1)}°C
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Thermometer className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-muted-foreground">Batas Bawah</p>
                    <p className="font-medium">
                      {threeDayPredictions[0].lower_bound?.toFixed(1)}°C
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Thermometer className="h-6 w-6 mx-auto mb-2 text-red-500" />
                    <p className="text-sm text-muted-foreground">Batas Atas</p>
                    <p className="font-medium">
                      {threeDayPredictions[0].upper_bound?.toFixed(1)}°C
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Sprout className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-muted-foreground">Saran Tanam</p>
                    <Badge className={getPlantAdviceColor(threeDayPredictions[0].plantAdvice)}>
                      {getPlantAdviceText(threeDayPredictions[0].plantAdvice)}
                    </Badge>
                  </div>
                </div>
              ) : weatherData && weatherData.weeklyWeather && weatherData.weeklyWeather.length > 0 ? (
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
              ) : (
                <p className="text-center text-muted-foreground">Detail tidak tersedia</p>
              )}
            </CardContent>
          </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="ml-prediction">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Prediksi Suhu dengan Machine Learning
                </div>
                <Badge variant="outline" className="bg-blue-50">
                  {backendPredictions && backendPredictions.length > 0
                    ? backendPredictions[0]?.source || "ML Model"
                    : "Loading..."}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Prediksi suhu menggunakan algoritma Machine Learning berdasarkan data historis
              </p>
            </CardHeader>
            <CardContent>
              {!backendPredictions || backendPredictions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Prediksi ML tidak tersedia saat ini
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Prediction Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {backendPredictions.map((pred: any, index: number) => {
                      const predDate = new Date(pred.date);
                      const dayName = predDate.toLocaleDateString("id-ID", {
                        weekday: "short",
                      });
                      const dateStr = predDate.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      });

                      return (
                        <Card key={index} className="border-2">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="text-center">
                                <h3 className="font-semibold">{dayName}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {dateStr}
                                </p>
                              </div>
                              
                              <div className="text-center">
                                <Thermometer className="h-10 w-10 mx-auto mb-2 text-orange-500" />
                                <div className="text-2xl font-bold">
                                  {pred.predicted_temp?.toFixed(1)}°C
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Prediksi Suhu
                                </p>
                              </div>

                              <div className="pt-3 border-t space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">
                                    Rentang:
                                  </span>
                                  <span className="font-medium">
                                    {pred.lower_bound?.toFixed(1)}° -{" "}
                                    {pred.upper_bound?.toFixed(1)}°C
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-400 to-orange-400 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        ((pred.predicted_temp - pred.lower_bound) /
                                          (pred.upper_bound - pred.lower_bound)) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Chart */}
                  <Card>
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
                            min: pred.lower_bound,
                            max: pred.upper_bound,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip
                            formatter={(value: any) => [
                              `${value.toFixed(1)}°C`,
                              "",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="max"
                            stroke="#fbbf24"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Batas Atas"
                          />
                          <Line
                            type="monotone"
                            dataKey="suhu"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ fill: "#f59e0b", r: 4 }}
                            name="Prediksi"
                          />
                          <Line
                            type="monotone"
                            dataKey="min"
                            stroke="#60a5fa"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Batas Bawah"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Info Box */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">
                            Tentang Prediksi ML
                          </h4>
                          <p className="text-sm text-blue-800">
                            Prediksi ini menggunakan algoritma machine learning yang
                            dilatih dengan data historis cuaca. Rentang suhu (batas
                            atas dan bawah) menunjukkan tingkat kepercayaan prediksi.
                            Semakin sempit rentang, semakin akurat prediksinya.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Prediksi Tanaman Bulanan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Rekomendasi tanaman berdasarkan prediksi iklim
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Sprout className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Fitur Segera Hadir</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Rekomendasi tanaman bulanan berbasis AI sedang dalam pengembangan. 
                  Saat ini Anda dapat menggunakan prediksi cuaca dari tab lainnya.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <Badge variant="outline" className="bg-blue-50">
                    <Thermometer className="h-3 w-3 mr-1" />
                    Prediksi AI/ML Tersedia
                  </Badge>
                  <Badge variant="outline" className="bg-green-50">
                    <Cloud className="h-3 w-3 mr-1" />
                    Data BMKG Real-time
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
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

            {/* ML Prediction Comparison */}
            {backendPredictions && backendPredictions.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    Perbandingan: Prakiraan BMKG vs Prediksi ML
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={(() => {
                        // Combine BMKG and ML data
                        const combined = weatherData.rainfallData.map((item: any, idx: number) => ({
                          day: item.day,
                          bmkg: item.temp,
                          ml: backendPredictions[idx]?.predicted_temp || null,
                        }));
                        return combined;
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: string) => [
                          `${value?.toFixed(1)}°C`,
                          name === "bmkg" ? "BMKG" : "ML Prediction",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="bmkg"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="BMKG"
                        dot={{ fill: "#3b82f6", r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ml"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="ML"
                        dot={{ fill: "#f59e0b", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
                      <span>Prakiraan BMKG</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-0.5 bg-orange-500 border-dashed mr-2"></div>
                      <span>Prediksi ML</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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