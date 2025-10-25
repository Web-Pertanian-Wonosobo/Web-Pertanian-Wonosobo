// Komoditas API Service
// Handles API calls to Wonosobo commodity data

export interface Komoditas {
  id: number;
  nama: string;
  harga?: number;
  satuan?: string;
  tanggal?: string;
  perubahan?: string;
  kategori?: string;
  [key: string]: any; // untuk field tambahan yang mungkin ada
}

export interface KomoditasResponse {
  success?: boolean;
  data?: Komoditas[];
  [key: string]: any;
}

/**
 * Fetch data komoditas dari API Disdagkopukm Wonosobo
 */
export const fetchKomoditas = async (): Promise<Komoditas[]> => {
  try {
    const response = await fetch(
      "https://disdagkopukm.wonosobokab.go.id/api/produk-komoditas"
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Raw komoditas response:", data);
    
    // Cek struktur response dan extract data
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data : [];
    }
    
    // Fallback jika struktur tidak dikenali
    return [];
  } catch (error) {
    console.error("Error fetching komoditas data:", error);
    return [];
  }
};

/**
 * Filter komoditas berdasarkan kategori
 */
export const filterKomoditasByCategory = (
  komoditas: Komoditas[],
  category: string
): Komoditas[] => {
  if (!category || category === "all") return komoditas;
  return komoditas.filter(
    (item) =>
      item.kategori?.toLowerCase() === category.toLowerCase() ||
      item.nama?.toLowerCase().includes(category.toLowerCase())
  );
};

/**
 * Cari komoditas berdasarkan nama
 */
export const searchKomoditas = (
  komoditas: Komoditas[],
  query: string
): Komoditas[] => {
  if (!query) return komoditas;
  const lowerQuery = query.toLowerCase();
  return komoditas.filter((item) =>
    item.nama?.toLowerCase().includes(lowerQuery)
  );
};
