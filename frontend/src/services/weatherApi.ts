// Weather API Service
// Handles all backend API calls for weather data and predictions

export interface WeatherPrediction {
  date: string;
  predicted_temp: number;
  lower_bound: number;
  upper_bound: number;
  source: string;
}

export interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  location_name: string;
  is_interpolated?: boolean;
  interpolation_sources?: string[];
  interpolation_method?: string;
}

export interface PredictionResponse {
  status: string;
  predictions: WeatherPrediction[];
}

export interface WeatherDataResponse {
  status: string;
  data: WeatherData[];
}

// Koordinat untuk setiap kecamatan di Wonosobo
const WONOSOBO_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "Wadaslintang": { lat: -7.5167, lon: 109.9167 },
  "Kalikajar": { lat: -7.3833, lon: 109.7500 },
  "Wonosobo Kota": { lat: -7.3667, lon: 109.9000 },
  "Wonosobo": { lat: -7.3667, lon: 109.9000 }, // Alias untuk Wonosobo Kota
  "Leksono": { lat: -7.3833, lon: 109.8500 },
  "Kertek": { lat: -7.4167, lon: 109.8833 },
  "Garung": { lat: -7.4500, lon: 109.8667 },
  "Kaliwiro": { lat: -7.4333, lon: 109.8167 },
  "Kalibawang": { lat: -7.4833, lon: 109.8833 },
  "Selomerto": { lat: -7.4667, lon: 109.9167 },
  "Kejajar": { lat: -7.3500, lon: 109.8000 },
  "Mojotengah": { lat: -7.4000, lon: 109.9500 },
};

/**
 * Fetch ML weather predictions from backend using coordinates (REAL DATA)
 * @param days - Number of days to predict (default: 7)
 * @param location - Location name for prediction (optional)
 */
export const fetchWeatherPredictions = async (
  days: number = 7,
  location?: string
): Promise<WeatherPrediction[]> => {
  try {
    // Gunakan endpoint koordinat yang menggunakan data real OpenWeather
    if (location && WONOSOBO_COORDINATES[location]) {
      const coords = WONOSOBO_COORDINATES[location];
      const url = `http://127.0.0.1:8000/weather/predict/coordinates?lat=${coords.lat}&lon=${coords.lon}&location_name=${encodeURIComponent(location)}&days=${days}`;
      
      console.log(`🌦️ Fetching REAL weather predictions for ${location} using coordinates (${coords.lat}, ${coords.lon})`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PredictionResponse = await response.json();
      console.log('✅ Real coordinates prediction response:', data);
      console.log('📊 Predictions array (REAL DATA):', data.predictions);
      if (data.predictions && data.predictions.length > 0) {
        console.log('🔍 First prediction item (REAL):', data.predictions[0]);
      }
      return data.predictions || [];
    } else {
      // Fallback ke endpoint legacy jika tidak ada koordinat
      console.warn(`⚠️ No coordinates found for ${location}, using legacy endpoint`);
      let url = `http://127.0.0.1:8000/weather/predict?days=${days}`;
      if (location) {
        url += `&location=${encodeURIComponent(location)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PredictionResponse = await response.json();
      console.log('Legacy API response:', data);
      return data.predictions || [];
    }
  } catch (error) {
    console.error("Error fetching weather predictions:", error);
    return [];
  }
};

/**
 * Fetch current/historical weather data from backend
 */
export const fetchCurrentWeather = async (): Promise<WeatherData[]> => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/weather/current`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: WeatherDataResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching current weather:", error);
    return [];
  }
};

/**
 * Manually sync weather data from OpenWeather API
 */
export const syncWeatherData = async (): Promise<boolean> => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/weather/sync`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.status === "success";
  } catch (error) {
    console.error("Error syncing weather data:", error);
    return false;
  }
};

/**
 * Check if backend is available
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/health`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
