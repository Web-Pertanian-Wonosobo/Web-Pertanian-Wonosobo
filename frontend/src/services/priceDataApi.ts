/**
 * Price Data Management API Service
 * For admin to manually input historical price data
 */

export interface PriceData {
  price_id?: number;
  commodity_name: string;
  market_location: string;
  unit: string;
  price: number;
  date: string;
  created_at?: string;
}

export interface PriceDataCreate {
  user_id?: number;
  commodity_name: string;
  market_location: string;
  unit: string;
  price: number;
  date: string;
}

const BACKEND_API = "http://127.0.0.1:8000/market";

/**
 * Fetch all price data from local database
 */
export const fetchPriceData = async (
  commodity?: string,
  location?: string,
  startDate?: string,
  endDate?: string,
  limit: number = 100
): Promise<PriceData[]> => {
  try {
    const params = new URLSearchParams();
    if (commodity) params.append("commodity", commodity);
    if (location) params.append("location", location);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    params.append("limit", limit.toString());

    const url = `${BACKEND_API}/list?${params.toString()}`;
    console.log(`📊 Fetching price data: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("❌ Error fetching price data:", error);
    throw error;
  }
};

/**
 * Add new price data (admin input)
 */
export const addPriceData = async (
  data: PriceDataCreate
): Promise<{ success: boolean; message: string; price_id?: number }> => {
  try {
    const url = `${BACKEND_API}/add`;
    console.log(`➕ Adding price data:`, data);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || "Data berhasil ditambahkan",
      price_id: result.data,
    };
  } catch (error: any) {
    console.error("❌ Error adding price data:", error);
    return {
      success: false,
      message: error.message || "Gagal menambahkan data",
    };
  }
};

/**
 * Update existing price data
 */
export const updatePriceData = async (
  priceId: number,
  data: PriceDataCreate
): Promise<{ success: boolean; message: string }> => {
  try {
    const url = `${BACKEND_API}/update/${priceId}`;
    console.log(`✏️ Updating price data ${priceId}:`, data);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || "Data berhasil diupdate",
    };
  } catch (error: any) {
    console.error("❌ Error updating price data:", error);
    return {
      success: false,
      message: error.message || "Gagal update data",
    };
  }
};

/**
 * Delete price data
 */
export const deletePriceData = async (
  priceId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const url = `${BACKEND_API}/delete/${priceId}`;
    console.log(`🗑️ Deleting price data ${priceId}`);

    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || "Data berhasil dihapus",
    };
  } catch (error: any) {
    console.error("❌ Error deleting price data:", error);
    return {
      success: false,
      message: error.message || "Gagal menghapus data",
    };
  }
};

/**
 * Bulk add price data (for multiple entries at once)
 */
export const bulkAddPriceData = async (
  dataList: PriceDataCreate[]
): Promise<{ success: boolean; message: string; added: number }> => {
  try {
    let successCount = 0;
    let errorCount = 0;

    for (const data of dataList) {
      const result = await addPriceData(data);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    return {
      success: errorCount === 0,
      message: `Berhasil: ${successCount}, Gagal: ${errorCount}`,
      added: successCount,
    };
  } catch (error: any) {
    console.error("❌ Error bulk adding:", error);
    return {
      success: false,
      message: error.message || "Gagal bulk add",
      added: 0,
    };
  }
};
