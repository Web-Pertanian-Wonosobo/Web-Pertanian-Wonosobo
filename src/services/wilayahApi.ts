/**
 * Service untuk mengambil data wilayah dari API Disdukcapil Wonosobo
 */

export interface Wilayah {
  id: number;
  kode: string;
  nama: string;
  latlong_area: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface WilayahApiResponse {
  success: boolean;
  message: string;
  data: Wilayah[];
}

// Gunakan backend proxy untuk menghindari CORS
const BACKEND_API_URL = "http://127.0.0.1:8000/wilayah/list";

/**
 * Mengambil semua data wilayah kecamatan di Wonosobo
 * Menggunakan backend proxy untuk menghindari masalah CORS
 */
export async function fetchWilayah(): Promise<Wilayah[]> {
  try {
    const response = await fetch(BACKEND_API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: WilayahApiResponse = await response.json();
    
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    
    throw new Error("Format response tidak sesuai");
  } catch (error) {
    console.error("Error fetching wilayah data:", error);
    throw error;
  }
}

/**
 * Mengambil wilayah berdasarkan nama kecamatan
 */
export async function fetchWilayahByName(nama: string): Promise<Wilayah | null> {
  try {
    const wilayahList = await fetchWilayah();
    const found = wilayahList.find(
      (w) => w.nama.toLowerCase() === nama.toLowerCase()
    );
    return found || null;
  } catch (error) {
    console.error(`Error fetching wilayah by name ${nama}:`, error);
    return null;
  }
}

/**
 * Mengambil wilayah berdasarkan kode
 */
export async function fetchWilayahByKode(kode: string): Promise<Wilayah | null> {
  try {
    const wilayahList = await fetchWilayah();
    const found = wilayahList.find((w) => w.kode === kode);
    return found || null;
  } catch (error) {
    console.error(`Error fetching wilayah by kode ${kode}:`, error);
    return null;
  }
}

/**
 * Mendapatkan daftar nama kecamatan saja
 */
export async function fetchKecamatanNames(): Promise<string[]> {
  try {
    const wilayahList = await fetchWilayah();
    return wilayahList.map((w) => w.nama);
  } catch (error) {
    console.error("Error fetching kecamatan names:", error);
    return [];
  }
}

/**
 * Parse koordinat polygon dari latlong_area string
 * Returns array of [longitude, latitude] pairs
 */
export function parseLatLongArea(latlong_area: string): [number, number][] {
  try {
    const coordinates = JSON.parse(latlong_area);
    // Format dari API adalah array nested: [[[[lng, lat], ...]]]
    if (Array.isArray(coordinates) && coordinates.length > 0) {
      // Ambil array terdalam yang berisi koordinat
      let coords = coordinates;
      while (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
        coords = coords[0];
      }
      return coords as [number, number][];
    }
    return [];
  } catch (error) {
    console.error("Error parsing latlong_area:", error);
    return [];
  }
}
