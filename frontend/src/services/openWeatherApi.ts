// OpenWeather Direct API Service
// Untuk mengambil data langsung dari API OpenWeather tanpa melalui backend

export interface OpenWeatherCurrent {
  dt: number;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  rain?: {
    '1h': number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  name: string;
}

export interface OpenWeatherForecast {
  dt: number;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    feels_like: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  rain?: {
    '3h': number;
  };
  dt_txt: string;
}

export interface OpenWeatherForecastResponse {
  list: OpenWeatherForecast[];
  city: {
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
  };
}

export interface ParsedOpenWeatherData {
  location: string;
  current?: OpenWeatherCurrent;
  forecasts: OpenWeatherForecast[];
}

// Koordinat kecamatan di Wonosobo
export const WONOSOBO_COORDINATES = {
  'Wadaslintang': { lat: -7.5167, lon: 109.9167 },
  'Kalikajar': { lat: -7.3833, lon: 109.7500 },
  'Wonosobo': { lat: -7.3667, lon: 109.9000 },
  'Leksono': { lat: -7.3833, lon: 109.8500 },
  'Kertek': { lat: -7.4167, lon: 109.8833 },
  'Garung': { lat: -7.4500, lon: 109.8667 },
  'Kaliwiro': { lat: -7.4333, lon: 109.8167 },
  'Kalibawang': { lat: -7.4833, lon: 109.8833 },
  'Selomerto': { lat: -7.4667, lon: 109.9167 },
  'Kejajar': { lat: -7.3500, lon: 109.8000 },
  'Mojotengah': { lat: -7.4000, lon: 109.9500 },
} as const;

/**
 * Fetch weather data directly from OpenWeather API
 * @param location - Nama kecamatan atau koordinat
 * @param apiKey - OpenWeather API key
 */
export const fetchOpenWeatherDirect = async (
  location: string = "Wonosobo",
  apiKey: string = "803399b54a5c001328d36698c5a25317"
): Promise<ParsedOpenWeatherData | null> => {
  try {
    // Dapatkan koordinat berdasarkan nama lokasi
    const coords = WONOSOBO_COORDINATES[location as keyof typeof WONOSOBO_COORDINATES] || 
                   WONOSOBO_COORDINATES['Wonosobo'];

    const baseUrl = "https://api.openweathermap.org/data/2.5";
    
    // Fetch current weather
    const currentResponse = await fetch(
      `${baseUrl}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`
    );
    
    if (!currentResponse.ok) {
      throw new Error(`HTTP error! status: ${currentResponse.status}`);
    }
    
    const currentData: OpenWeatherCurrent = await currentResponse.json();
    
    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `${baseUrl}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`HTTP error! status: ${forecastResponse.status}`);
    }
    
    const forecastData: OpenWeatherForecastResponse = await forecastResponse.json();
    
    return {
      location: location,
      current: currentData,
      forecasts: forecastData.list,
    };
  } catch (error) {
    console.error("Error fetching OpenWeather data:", error);
    return null;
  }
};

/**
 * Group forecasts by day - works with both OpenWeather and custom data formats
 */
export const groupForecastsByDay = (forecasts: any[]) => {
  const grouped: Record<string, any[]> = {};
  
  forecasts.forEach(forecast => {
    let date: Date;
    
    // Handle different date formats
    if (forecast.dt) {
      // OpenWeather format (Unix timestamp)
      date = new Date(forecast.dt * 1000);
    } else if (forecast.date) {
      // Custom format (ISO string)
      date = new Date(forecast.date);
    } else {
      return; // Skip if no recognizable date
    }
    
    const day = date.toLocaleDateString('id-ID', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
    
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(forecast);
  });
  
  return grouped;
};

/**
 * Calculate average temperature for a day
 */
export const getAverageTemp = (forecasts: any[]) => {
  if (!forecasts.length) return 0;
  
  const temps = forecasts.map(f => {
    // Handle both OpenWeather and custom formats
    return f.main?.temp || f.temperature || 0;
  });
  
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
  return Number(avg.toFixed(1));
};

/**
 * Calculate total rainfall for a day
 */
export const getTotalRainfall = (forecasts: any[]) => {
  return forecasts.reduce((total, f) => {
    // Handle both OpenWeather and custom formats
    const rainfall = f.rain?.['3h'] || f.rain?.['1h'] || f.rainfall || 0;
    return total + rainfall;
  }, 0);
};

/**
 * Get dominant weather for a day
 */
export const getDominantWeather = (forecasts: any[]) => {
  if (!forecasts.length) return 'Cerah';
  
  const weatherCounts: Record<string, number> = {};
  
  forecasts.forEach(f => {
    // Handle both OpenWeather and custom formats
    const weather = f.weather?.[0]?.main || f.weather || 'Clear';
    const translatedWeather = getWeatherDescription(weather);
    weatherCounts[translatedWeather] = (weatherCounts[translatedWeather] || 0) + 1;
  });
  
  return Object.keys(weatherCounts).reduce((a, b) => 
    weatherCounts[a] > weatherCounts[b] ? a : b
  );
};

/**
 * Convert weather icon to description
 */
export const getWeatherDescription = (weather: string) => {
  const descriptions: Record<string, string> = {
    'Clear': 'Cerah',
    'Clouds': 'Berawan',
    'Rain': 'Hujan',
    'Drizzle': 'Gerimis',
    'Snow': 'Salju',
    'Thunderstorm': 'Badai Petir',
    'Fog': 'Kabut',
    'Mist': 'Kabut Tipis',
  };
  
  return descriptions[weather] || weather;
};