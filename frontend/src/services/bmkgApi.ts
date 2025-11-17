// BMKG Direct API Service
// Untuk mengambil data langsung dari API BMKG tanpa melalui backend

export interface BMKGForecast {
  datetime: string;
  local_datetime: string;
  t: number;              // Temperature (°C)
  hu: number;             // Humidity (%)
  tp: number;             // Rainfall (mm)
  ws: number;             // Wind Speed (km/h)
  wd: string;             // Wind Direction
  weather: string;        // Weather condition
  weather_desc: string;   // Weather description
  image: string;          // Weather icon URL
  vs_text: string;        // Visibility text
}

export interface BMKGLocation {
  adm4: string;
  desa: string;
  kecamatan: string;
  kotkab: string;
  provinsi: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface BMKGResponse {
  lokasi: BMKGLocation;
  data: Array<{
    cuaca: BMKGForecast[][];
  }>;
}

export interface ParsedBMKGData {
  location: BMKGLocation;
  forecasts: BMKGForecast[];
}

/**
 * Fetch weather data directly from BMKG API
 * @param adm4Code - Kode wilayah administrative level 4 (contoh: 31.71.03.1001 untuk Wonosobo)
 */
export const fetchBMKGDirect = async (
  adm4Code: string = "31.71.03.1001"
): Promise<ParsedBMKGData | null> => {
  try {
    const response = await fetch(
      `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4Code}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: BMKGResponse = await response.json();
    
    // Parse nested cuaca arrays
    const forecasts: BMKGForecast[] = [];
    
    for (const item of data.data) {
      for (const dayForecast of item.cuaca) {
        for (const forecast of dayForecast) {
          forecasts.push(forecast);
        }
      }
    }
    
    return {
      location: data.lokasi,
      forecasts: forecasts,
    };
  } catch (error) {
    console.error("Error fetching BMKG data:", error);
    return null;
  }
};

/**
 * Kode wilayah (ADM4) untuk daerah di Wonosobo
 */
export const WONOSOBO_ADM4_CODES = {
  WONOSOBO: "31.71.03.1001",
  KERTEK: "31.71.01.1001",
  GARUNG: "31.71.02.1001",
  LEKSONO: "31.71.04.1001",
  KALIWIRO: "31.71.05.1001",
  SUKOHARJO: "31.71.06.1001",
  SAPURAN: "31.71.07.1001",
  KALIBAWANG: "31.71.08.1001",
  KALIKAJAR: "31.71.09.1001",
  KEPIL: "31.71.10.1001",
  MOJOTENGAH: "31.71.11.1001",
  SELOMERTO: "31.71.12.1001",
  WADASLINTANG: "31.71.13.1001",
  WATUMALANG: "31.71.14.1001",
  KEJAJAR: "31.71.15.1001",
};

/**
 * Format tanggal untuk display
 */
export const formatBMKGDate = (datetime: string): string => {
  const date = new Date(datetime);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("id-ID", options);
};

/**
 * Group forecasts by day
 */
export const groupForecastsByDay = (
  forecasts: BMKGForecast[]
): Record<string, BMKGForecast[]> => {
  const grouped: Record<string, BMKGForecast[]> = {};
  
  forecasts.forEach((forecast) => {
    const date = new Date(forecast.datetime).toLocaleDateString("id-ID");
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(forecast);
  });
  
  return grouped;
};

/**
 * Get average temperature for a day
 */
export const getAverageTemp = (forecasts: BMKGForecast[]): number => {
  if (forecasts.length === 0) return 0;
  const sum = forecasts.reduce((acc, f) => acc + f.t, 0);
  return Math.round(sum / forecasts.length);
};

/**
 * Get total rainfall for a day
 */
export const getTotalRainfall = (forecasts: BMKGForecast[]): number => {
  return forecasts.reduce((acc, f) => acc + f.tp, 0);
};

/**
 * Get most common weather condition for a day
 */
export const getDominantWeather = (forecasts: BMKGForecast[]): string => {
  if (forecasts.length === 0) return "Unknown";
  
  const weatherCounts: Record<string, number> = {};
  forecasts.forEach((f) => {
    weatherCounts[f.weather] = (weatherCounts[f.weather] || 0) + 1;
  });
  
  return Object.keys(weatherCounts).reduce((a, b) =>
    weatherCounts[a] > weatherCounts[b] ? a : b
  );
};