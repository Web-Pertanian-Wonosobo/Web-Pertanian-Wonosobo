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

/**
 * Fetch ML weather predictions from backend
 * @param days - Number of days to predict (default: 7)
 * @param location - Location name for prediction (optional)
 */
export const fetchWeatherPredictions = async (
  days: number = 7,
  location?: string
): Promise<WeatherPrediction[]> => {
  try {
    let url = `http://127.0.0.1:8000/weather/predict?days=${days}`;
    if (location) {
      url += `&location=${encodeURIComponent(location)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: PredictionResponse = await response.json();
    console.log('Raw API response:', data);
    console.log('Predictions array:', data.predictions);
    if (data.predictions && data.predictions.length > 0) {
      console.log('First prediction item:', data.predictions[0]);
    }
    return data.predictions || [];
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
