// Crop Recommendation API Service
// Handles all backend API calls for crop recommendations based on weather predictions

export interface CropData {
  name: string;
  category: string;
  temp_optimal: [number, number];
  rainfall_optimal: [number, number];
  growth_period: number;
  economic_value: string;
  difficulty: string;
  description: string;
}

export interface CropRecommendation {
  id: string;
  data: CropData;
  score: number;
  suitability: string;
}

export interface WeatherAnalysis {
  avg_temp: number;
  total_rainfall: number;
  avg_humidity: number;
  prediction_days: number;
}

export interface CropRecommendationResponse {
  status: string;
  coordinates?: { lat: number; lon: number };
  location_name: string;
  weather_predictions_used: number;
  prediction_source?: string;
  weather_analysis: WeatherAnalysis;
  recommendations: {
    highly_recommended: CropRecommendation[];
    recommended: CropRecommendation[];
    not_recommended: CropRecommendation[];
  };
  planting_tips: string[];
  season_info: {
    season: string;
    description: string;
  };
}

export interface CropDatabaseItem {
  id: string;
  name: string;
  category: string;
  temp_optimal: string;
  rainfall_optimal: string;
  growth_period: string;
  economic_value: string;
  difficulty: string;
  description: string;
}

export interface LocationData {
  name: string;
  coordinates: { lat: number; lon: number };
  region: string;
}

/**
 * Get crop recommendations based on coordinates and weather predictions
 */
export const fetchCropRecommendationsByCoordinates = async (
  lat: number,
  lon: number,
  locationName?: string,
  days: number = 7
): Promise<CropRecommendationResponse> => {
  try {
    let url = `http://127.0.0.1:8080/crops/recommend/coordinates?lat=${lat}&lon=${lon}&days=${days}`;
    if (locationName) {
      url += `&location_name=${encodeURIComponent(locationName)}`;
    }

    console.log(`🌾 Fetching crop recommendations for coordinates (${lat}, ${lon})`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: CropRecommendationResponse = await response.json();
    console.log('✅ Crop recommendations received:', data);
    
    return data;
  } catch (error) {
    console.error("Error fetching crop recommendations by coordinates:", error);
    throw error;
  }
};

/**
 * Get crop recommendations based on location name
 */
export const fetchCropRecommendationsByLocation = async (
  location: string,
  days: number = 7
): Promise<CropRecommendationResponse> => {
  try {
    const url = `http://127.0.0.1:8080/crops/recommend?location=${encodeURIComponent(location)}&days=${days}`;
    
    console.log(`🌾 Fetching crop recommendations for location: ${location}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: CropRecommendationResponse = await response.json();
    console.log('✅ Crop recommendations received:', data);
    
    return data;
  } catch (error) {
    console.error("Error fetching crop recommendations by location:", error);
    throw error;
  }
};

/**
 * Get the complete crops database
 */
export const fetchCropsDatabase = async (): Promise<{
  status: string;
  total_crops: number;
  categories: string[];
  crops: CropDatabaseItem[];
}> => {
  try {
    const response = await fetch('http://127.0.0.1:8080/crops/database');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Crops database received:', data);
    
    return data;
  } catch (error) {
    console.error("Error fetching crops database:", error);
    throw error;
  }
};

/**
 * Get available locations for crop recommendations
 */
export const fetchAvailableLocations = async (): Promise<{
  status: string;
  total_locations: number;
  locations: LocationData[];
}> => {
  try {
    const response = await fetch('http://127.0.0.1:8080/crops/locations');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Available locations received:', data);
    
    return data;
  } catch (error) {
    console.error("Error fetching available locations:", error);
    throw error;
  }
};