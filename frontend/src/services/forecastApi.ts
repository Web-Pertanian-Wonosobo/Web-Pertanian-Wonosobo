/**
 * Forecasting API Service
 * Handles API calls to backend forecasting endpoints
 */

export interface ForecastPrediction {
  date: string;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  actual_price?: number;
}

export interface ForecastStatistics {
  average_predicted_price: number;
  min_predicted_price: number;
  max_predicted_price: number;
  price_trend: "naik" | "turun" | "stabil";
  trend_percentage: number;
}

export interface BestSellingDate {
  date: string;
  predicted_price: number;
  confidence_range: string;
}

export interface ForecastResult {
  success: boolean;
  commodity: string;
  model: string;
  is_synthetic?: boolean;
  current_price: number;
  last_actual_date: string;
  forecast_days: number;
  historical_data_points: number;
  statistics: ForecastStatistics;
  historical: ForecastPrediction[];
  predictions: ForecastPrediction[];
  best_selling_dates: BestSellingDate[];
  message?: string;
}

export interface QuickPredictionResult {
  success: boolean;
  commodity: string;
  target_date: string;
  current_price: number;
  predicted_price: number;
  confidence_range: {
    lower: number;
    upper: number;
  };
  price_change: {
    amount: number;
    percentage: number;
  };
}

const BACKEND_API = "http://127.0.0.1:8080";

/**
 * Forecast harga komoditas untuk beberapa hari ke depan
 */
export const forecastCommodityPrice = async (
  commodityName: string,
  daysForward: number = 30,
  daysBack: number = 90,
  useSynthetic: boolean = true
): Promise<ForecastResult> => {
  try {
    const url = `${BACKEND_API}/forecast/commodity/${encodeURIComponent(
      commodityName
    )}?days_forward=${daysForward}&days_back=${daysBack}&use_synthetic=${useSynthetic}`;
    console.log(`📈 Forecasting: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    const data: ForecastResult = await response.json();
    console.log("✅ Forecast result:", data);

    return data;
  } catch (error) {
    console.error("❌ Forecast error:", error);
    throw error;
  }
};

/**
 * Batch forecasting untuk multiple komoditas
 */
export const batchForecast = async (
  commodityNames: string[],
  daysForward: number = 30
): Promise<{
  total_requested: number;
  successful_forecasts: number;
  failed_forecasts: number;
  results: ForecastResult[];
}> => {
  try {
    const url = `${BACKEND_API}/forecast/batch?days_forward=${daysForward}`;
    console.log(`📊 Batch forecasting: ${commodityNames.length} commodities`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commodityNames),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Batch forecast completed:", data);

    return data;
  } catch (error) {
    console.error("❌ Batch forecast error:", error);
    throw error;
  }
};

/**
 * Get available commodities untuk forecasting
 */
export const getAvailableCommodities = async (): Promise<string[]> => {
  try {
    const url = `${BACKEND_API}/forecast/available-commodities`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.commodities || [];
  } catch (error) {
    console.error("❌ Error getting commodities:", error);
    return [];
  }
};

/**
 * Quick prediction untuk tanggal tertentu
 */
export const quickPricePrediction = async (
  commodityName: string,
  targetDate?: string
): Promise<QuickPredictionResult> => {
  try {
    const url = targetDate
      ? `${BACKEND_API}/forecast/quick-predict/${encodeURIComponent(
          commodityName
        )}?target_date=${targetDate}`
      : `${BACKEND_API}/forecast/quick-predict/${encodeURIComponent(
          commodityName
        )}`;

    console.log(`⚡ Quick prediction: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    const data: QuickPredictionResult = await response.json();
    console.log("✅ Quick prediction result:", data);

    return data;
  } catch (error) {
    console.error("❌ Quick prediction error:", error);
    throw error;
  }
};

/**
 * Format currency to Rupiah
 */
export const formatRupiah = (price: number): string => {
  if (!price || price === 0) return "Rp 0";
  return `Rp ${price.toLocaleString("id-ID")}`;
};

/**
 * Calculate days until target date
 */
export const daysUntil = (dateString: string): number => {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Format date to Indonesian format
 */
export const formatDateID = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
