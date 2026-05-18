const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const BACKEND_API = `${API_BASE_URL}/commodities`;

export interface Commodity {
  commodity_id: number;
  name: string;
  category: string;
  created_at: string;
}

export interface CommodityCreate {
  name: string;
  category?: string;
}

/**
 * Fetch all commodities from database
 */
export const fetchCommodities = async (): Promise<Commodity[]> => {
  try {
    const response = await fetch(`${BACKEND_API}/`);
    if (!response.ok) throw new Error("Gagal mengambil data komoditas");
    return await response.json();
  } catch (error) {
    console.error("Error fetching commodities:", error);
    return [];
  }
};

/**
 * Add new commodity to database
 */
export const addCommodity = async (data: CommodityCreate): Promise<{ success: boolean; message: string; data?: Commodity }> => {
  try {
    const response = await fetch(`${BACKEND_API}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Gagal menambah komoditas");
    }

    return {
      success: true,
      message: "Komoditas berhasil ditambahkan",
      data: result
    };
  } catch (error: any) {
    console.error("Error adding commodity:", error);
    return {
      success: false,
      message: error.message || "Gagal menambah komoditas"
    };
  }
};

/**
 * Delete commodity from database
 */
export const deleteCommodity = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${BACKEND_API}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.detail || "Gagal menghapus komoditas");
    }

    return {
      success: true,
      message: "Komoditas berhasil dihapus"
    };
  } catch (error: any) {
    console.error("Error deleting commodity:", error);
    return {
      success: false,
      message: error.message || "Gagal menghapus komoditas"
    };
  }
};
