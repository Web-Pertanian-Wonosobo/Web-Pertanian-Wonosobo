// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Badge } from "./ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import {
//   Cloud,
//   Droplets,
//   Wind,
//   Eye,
//   MapPin,
//   Calendar,
//   Thermometer,
// } from "lucide-react";
// import {
//   fetchCurrentWeather,
//   type WeatherData,
// } from "../src/services/weatherApi";

// // Helper functions
// function groupByLocation(data: WeatherData[]) {
//   const grouped: Record<string, WeatherData[]> = {};
//   data.forEach((item) => {
//     if (!grouped[item.location_name]) grouped[item.location_name] = [];
//     grouped[item.location_name].push(item);
//   });
//   return grouped;
// }

// function groupByDay(data: WeatherData[]) {
//   const grouped: Record<string, WeatherData[]> = {};
//   data.forEach((item) => {
//     const date = new Date(item.date).toLocaleDateString("id-ID", {
//       weekday: "short",
//       day: "numeric",
//       month: "short",
//     });
//     if (!grouped[date]) grouped[date] = [];
//     grouped[date].push(item);
//   });
//   return grouped;
// }

// function getAverageTemp(list: WeatherData[]) {
//   if (!list.length) return "0";
//   return (
//     list.reduce((sum, item) => sum + (item.temperature || 0), 0) / list.length
//   ).toFixed(1);
// }

// function getTotalRainfall(list: WeatherData[]) {
//   if (!list.length) return 0;
//   return list.reduce((sum, item) => sum + (item.rainfall || 0), 0);
// }

// function getWeatherDesc(temp: number, rainfall: number) {
//   if (rainfall > 5) return "Hujan Lebat";
//   if (rainfall > 1) return "Hujan Ringan";
//   if (temp > 30) return "Cerah Panas";
//   if (temp > 25) return "Cerah Berawan";
//   return "Berawan";
// }

// export function BMKGWeatherDashboard() {
//   const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
//   const [selectedLocation, setSelectedLocation] = useState<string>("all");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     loadWeatherData();
//   }, []);

//   const loadWeatherData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchCurrentWeather();
//       if (data && data.length > 0) {
//         setWeatherData(data);
//         console.log(" Weather data loaded:", data.length, "records");
//       } else {
//         setError("Tidak ada data cuaca tersedia");
//       }
//     } catch (err) {
//       setError("Terjadi kesalahan saat mengambil data");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Card>
//         <CardContent className="p-8 text-center">
//           <div className="animate-pulse space-y-4">
//             <Cloud className="h-12 w-12 mx-auto text-gray-400" />
//             <p className="text-muted-foreground">Memuat data cuaca...</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (error || !weatherData.length) {
//     return (
//       <Card>
//         <CardContent className="p-8 text-center">
//           <Cloud className="h-12 w-12 mx-auto mb-3 text-red-500" />
//           <p className="text-red-600 mb-4">{error || "Data tidak tersedia"}</p>
//           <button
//             onClick={loadWeatherData}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Coba Lagi
//           </button>
//         </CardContent>
//       </Card>
//     );
//   }

//   const locationGroups = groupByLocation(weatherData);
//   const locations = Object.keys(locationGroups).sort();
//   const filteredData =
//     selectedLocation === "all"
//       ? weatherData
//       : locationGroups[selectedLocation] || [];
//   const dailyForecasts = groupByDay(filteredData);
//   const days = Object.keys(dailyForecasts).slice(0, 7);

//   return (
//     <div className="space-y-6">
//       {/* Header dengan Info Lokasi */}
//       <Card>
//         <CardHeader>
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <CardTitle className="flex items-center gap-2">
//                 <MapPin className="h-5 w-5 text-blue-600" />
//                 Data Cuaca Kabupaten Wonosobo
//               </CardTitle>
//               <p className="text-sm text-muted-foreground mt-1">
//                 {locations.length} lokasi | {weatherData.length} data prakiraan
//               </p>
//             </div>

//             <div className="w-full md:w-64">
//               <Select value={selectedLocation} onValueChange={setSelectedLocation}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Pilih Lokasi" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">Semua Lokasi</SelectItem>
//                   {locations.map((loc) => (
//                     <SelectItem key={loc} value={loc}>
//                       {loc}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>
//       </Card>

//       {/* Prakiraan 7 Hari */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {days.map((day, index) => {
//           const dayData = dailyForecasts[day];
//           const avgTemp = getAverageTemp(dayData);
//           const totalRain = getTotalRainfall(dayData);
//           const weatherDesc = getWeatherDesc(Number(avgTemp), totalRain);
//           const firstItem = dayData[0];

//           return (
//             <Card key={index} className="hover:shadow-lg transition-shadow">
//               <CardContent className="p-4">
//                 <div className="space-y-3">
//                   {/* Tanggal */}
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="font-semibold">{day}</h3>
//                       <p className="text-xs text-muted-foreground">
//                         Hari ke-{index + 1}
//                       </p>
//                     </div>
//                     <Badge variant="outline">{dayData.length}x update</Badge>
//                   </div>

//                   {/* Icon Cuaca */}
//                   <div className="flex justify-center py-3">
//                     <Cloud className="h-16 w-16 text-blue-400" />
//                   </div>

//                   {/* Suhu */}
//                   <div className="text-center">
//                     <div className="flex items-center justify-center gap-2">
//                       <Thermometer className="h-5 w-5 text-orange-500" />
//                       <span className="text-3xl font-bold">{avgTemp} C</span>
//                     </div>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       {weatherDesc}
//                     </p>
//                   </div>

//                   {/* Detail Cuaca */}
//                   <div className="grid grid-cols-2 gap-2 pt-2 border-t">
//                     <div className="flex items-center gap-2 text-sm">
//                       <Droplets className="h-4 w-4 text-blue-500" />
//                       <div>
//                         <p className="text-xs text-muted-foreground">Hujan</p>
//                         <p className="font-medium">{totalRain.toFixed(1)} mm</p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 text-sm">
//                       <Wind className="h-4 w-4 text-gray-500" />
//                       <div>
//                         <p className="text-xs text-muted-foreground">Angin</p>
//                         <p className="font-medium">
//                           {firstItem.wind_speed?.toFixed(1) || "0"} km/h
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 text-sm">
//                       <Droplets className="h-4 w-4 text-teal-500" />
//                       <div>
//                         <p className="text-xs text-muted-foreground">Kelembaban</p>
//                         <p className="font-medium">{firstItem.humidity || 0}%</p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 text-sm">
//                       <Eye className="h-4 w-4 text-purple-500" />
//                       <div>
//                         <p className="text-xs text-muted-foreground">Lokasi</p>
//                         <p className="font-medium text-xs truncate">
//                           {firstItem.location_name}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {/* Detail Hari Pertama */}
//       {days.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Calendar className="h-5 w-5" />
//               Detail Prakiraan - {days[0]}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {dailyForecasts[days[0]].slice(0, 8).map((item, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
//                 >
//                   {/* Lokasi */}
//                   <div className="w-40">
//                     <p className="font-medium text-sm">{item.location_name}</p>
//                     <p className="text-xs text-muted-foreground">
//                       {new Date(item.date).toLocaleDateString("id-ID")}
//                     </p>
//                   </div>

//                   {/* Icon */}
//                   <div className="flex items-center gap-2">
//                     <Cloud className="h-8 w-8 text-blue-400" />
//                   </div>

//                   {/* Data Cuaca */}
//                   <div className="flex gap-4 items-center">
//                     <div className="flex items-center gap-1">
//                       <Thermometer className="h-4 w-4 text-orange-500" />
//                       <span className="text-sm font-medium">{item.temperature} C</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Droplets className="h-4 w-4 text-blue-500" />
//                       <span className="text-sm">{item.humidity}%</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Cloud className="h-4 w-4 text-indigo-500" />
//                       <span className="text-sm">{item.rainfall?.toFixed(1) || 0}mm</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Wind className="h-4 w-4 text-slate-500" />
//                       <span className="text-sm">{item.wind_speed?.toFixed(1) || 0}km/h</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Attribution */}
//       <div className="text-center text-sm text-muted-foreground p-4 bg-slate-50 rounded-lg">
//         <p> Data cuaca Kabupaten Wonosobo dari database sistem</p>
//       </div>
//     </div>
//   );
// }
