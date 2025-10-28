// Komoditas API Service
// Handles API calls to Wonosobo commodity data

export interface Komoditas {
  id?: number;
  nama?: string;
  harga?: number;
  satuan?: string;
  tanggal?: string;
  perubahan?: string;
  kategori?: string;
  // Field alternatif yang mungkin ada di API
  harga_eceran?: number | string;
  harga_grosir?: number | string;
  harga_jual?: number | string;
  harga_beli?: number | string;
  nama_komoditas?: string;
  nama_produk?: string;
  [key: string]: any; // untuk field tambahan yang mungkin ada
}

export interface KomoditasResponse {
  success?: boolean;
  data?: Komoditas[];
  [key: string]: any;
}

const API_BASE = "https://disdagkopukm.wonosobokab.go.id/api";
const BACKEND_API = "http://127.0.0.1:8000/market";

// Gunakan database backend (data sudah di-sync otomatis dari API)
const USE_DATABASE = true;

/**
 * Normalize komoditas data - map various field names to standard format
 */
export const normalizeKomoditas = (item: any): Komoditas => {
  console.log("🔍 Normalizing item:", JSON.stringify(item, null, 2));
  console.log("Available fields:", Object.keys(item));
  
  // Extract nama - PRIORITAS: produk.name (nested object) atau name langsung
  let nama = "Tidak diketahui";
  
  // 1. Cek produk.name dulu (struktur dari /produk-komoditas)
  if (item.produk && typeof item.produk === 'object' && item.produk.name) {
    nama = item.produk.name;
    console.log(`✓ Found nama in "produk.name":`, nama);
  }
  // 2. Cek name langsung (struktur dari /produk/{id})
  else if (item.name && typeof item.name === 'string' && item.name.trim()) {
    nama = item.name;
    console.log(`✓ Found nama in "name":`, nama);
  }
  // 3. Fallback ke field lain
  else {
    const possibleNameFields = [
      'nama', 'nama_komoditas', 'nama_produk',
      'komoditas', 'commodity_name', 'product_name'
    ];
    
    for (const field of possibleNameFields) {
      const value = item[field];
      
      // Jika value adalah string langsung
      if (value && typeof value === 'string' && value.trim()) {
        console.log(`✓ Found nama in field "${field}" (string):`, value);
        nama = value;
        break;
      }
      
      // Jika value adalah object dengan property 'name'
      if (value && typeof value === 'object' && value.name && typeof value.name === 'string') {
        console.log(`✓ Found nama in field "${field}.name" (nested object):`, value.name);
        nama = value.name;
        break;
      }
    }
  }
  
  // Extract harga - PRIORITAS: harga_pasar
  let harga = 0;
  const possiblePriceFields = [
    'harga_pasar',      // ← PRIORITAS TERTINGGI (dari API)
    'harga_petani',     // Alternatif
    'harga', 'harga_eceran', 'harga_jual', 'harga_grosir', 'harga_satuan',
    'price', 'retail_price', 'wholesale_price'
  ];
  
  for (const field of possiblePriceFields) {
    if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
      const value = typeof item[field] === 'string' ? parseFloat(item[field]) : item[field];
      if (!isNaN(value) && value > 0) {
        harga = value;
        console.log(`✓ Found harga in field "${field}":`, harga);
        break;
      }
    }
  }
  
  if (harga === 0) {
    console.warn("⚠️ No valid harga field found! Item:", item);
  }
  if (nama === "Tidak diketahui") {
    console.warn("⚠️ No valid nama field found! Item:", item);
  }
  
  // Extract satuan - gunakan field 'unit' dari API
  const satuan = item.unit || item.satuan || item.satuan_unit || item.uom || "kg";
  
  // Extract kategori - gunakan kategori_komoditas.name
  let kategori = "Umum";
  if (item.kategori_komoditas && item.kategori_komoditas.name) {
    kategori = item.kategori_komoditas.name;
  } else {
    const kategoriValue = item.kategori || item.jenis || item.category;
    if (kategoriValue) {
      if (typeof kategoriValue === 'string') {
        kategori = kategoriValue;
      } else if (typeof kategoriValue === 'object' && kategoriValue.name) {
        kategori = kategoriValue.name;
      }
    }
  }
  
  const normalized = {
    id: item.id,
    nama: nama,
    harga: isNaN(harga) ? 0 : harga,
    satuan: satuan,
    tanggal: item.tgl || item.tanggal || item.updated_at || item.created_at || item.date,
    perubahan: item.perubahan || item.change || "0%",
    kategori: kategori,
  };
  
  console.log("→ Normalized result:", normalized);
  return normalized;
};

/**
 * Normalize data dari database backend (format berbeda dari API)
 */
export const normalizeFromDatabase = (item: any): Komoditas => {
  return {
    id: item.price_id || item.id,
    nama: item.commodity_name || "Tidak diketahui",
    harga: item.price || 0,
    satuan: item.unit || "kg",
    tanggal: item.date || item.created_at,
    perubahan: "0%", // Tidak ada data perubahan dari database
    kategori: item.category || "Umum",
  };
};

/**
 * Fetch data komoditas dari database backend (sudah di-sync otomatis dari API)
 */
export const fetchKomoditas = async (): Promise<Komoditas[]> => {
  try {
    // Ambil dari database backend (data sudah di-sync otomatis tiap 1 jam)
    const endpoint = USE_DATABASE 
      ? `${BACKEND_API}/list?limit=100`
      : `${BACKEND_API}/realtime/produk-komoditas`;
    
    console.log(`📡 Fetching komoditas from: ${endpoint}`);
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("📦 Raw komoditas response:", data);
    
    // Cek struktur response dan extract data
    let komoditasData: any[] = [];
    
    if (Array.isArray(data)) {
      komoditasData = data;
    } else if (data.data) {
      if (Array.isArray(data.data)) {
        komoditasData = data.data;
        console.log("✓ Database response: extracted from data array");
      } else if (data.data.data && Array.isArray(data.data.data)) {
        komoditasData = data.data.data;
        console.log("✓ Nested response: extracted from data.data.data");
      } else {
        komoditasData = [];
        console.log("⚠️ Unexpected data structure");
      }
    }
    
    // Log raw data SEBELUM normalisasi
    console.log("📋 FULL RAW JSON (sebelum normalisasi):");
    console.log(JSON.stringify(komoditasData, null, 2));
    
    if (komoditasData.length > 0) {
      console.log("\n🔍 FIRST ITEM detail:");
      console.log("Full object:", komoditasData[0]);
      console.log("All keys:", Object.keys(komoditasData[0]));
    }
    
    // Normalize data - untuk data dari database format berbeda
    const normalized = USE_DATABASE 
      ? komoditasData.map(normalizeFromDatabase)
      : komoditasData.map(normalizeKomoditas);
    
    console.log(`\n✅ Total ${normalized.length} komoditas dari ${USE_DATABASE ? 'database (auto-synced)' : 'API langsung'}`);
    console.log("📦 Sample normalized data:", normalized.slice(0, 2));
    
    return normalized;
  } catch (error) {
    console.error("Error fetching komoditas data:", error);
    return [];
  }
};

/**
 * Fetch data produk berdasarkan ID
 * @param id - ID produk (contoh: 1 untuk cabai, 2 untuk kubis)
 */
export const fetchProdukById = async (id: number): Promise<Komoditas[]> => {
  try {
    // Backend tidak punya endpoint /produk/{id}, gunakan API langsung
    const endpoint = `${API_BASE}/produk/${id}`;
    
    console.log(`📡 Fetching produk/${id} from direct API (backend tidak support endpoint ini)`);
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      console.warn(`HTTP error for produk/${id}! status: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`Raw produk/${id} response:`, data);
    console.log(`Type of response:`, typeof data, Array.isArray(data) ? 'is array' : 'not array');
    
    // Extract data - cek berbagai struktur
    let produkData: any[] = [];
    
    if (Array.isArray(data)) {
      produkData = data;
      console.log(`✓ produk/${id} adalah array langsung, ${data.length} items`);
    } else if (data.data) {
      if (Array.isArray(data.data)) {
        produkData = data.data;
        console.log(`✓ produk/${id} ada di data.data array, ${data.data.length} items`);
      } else {
        produkData = [data.data];
        console.log(`✓ produk/${id} ada di data.data object, dijadikan array`);
      }
    } else if (typeof data === 'object' && data.id) {
      // Kalau response adalah single object
      produkData = [data];
      console.log(`✓ produk/${id} adalah single object, dijadikan array`);
    }
    
    // Normalize data
    const normalized = produkData.map(normalizeKomoditas);
    
    console.log(`→ Hasil akhir produk/${id}:`, normalized.length, 'items');
    console.log(`→ Data normalized:`, normalized);
    
    return normalized;
  } catch (error) {
    console.error(`Error fetching produk ${id}:`, error);
    return [];
  }
};

/**
 * Fetch semua data komoditas dari database backend
 * Data sudah di-sync otomatis dari API tiap 1 jam
 */
export const fetchAllKomoditas = async (): Promise<Komoditas[]> => {
  try {
    console.log("🔄 Mengambil data dari database backend (auto-synced)...");
    
    // Langsung ambil dari database (sudah di-sync otomatis)
    const komoditasData = await fetchKomoditas();
    
    console.log(`\n✅ Total ${komoditasData.length} komoditas dari database`);
    console.log("📦 Final data:", komoditasData);
    
    return komoditasData;
  } catch (error) {
    console.error("Error fetching all komoditas:", error);
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

/**
 * CRUD Operations - Tambah, Edit, Hapus data ke backend database
 */

interface AddKomoditasData {
  commodity_name: string;
  market_location: string;
  unit: string;
  price: number;
  date?: string;
}

/**
 * Tambah data komoditas baru ke database
 */
export const addKomoditas = async (data: AddKomoditasData): Promise<{ success: boolean; message: string; id?: number }> => {
  try {
    console.log('📤 Sending data to backend:', data);
    
    // Prepare payload - JANGAN kirim date, biar backend yang generate
    const payload = {
      commodity_name: data.commodity_name,
      market_location: data.market_location,
      unit: data.unit,
      price: Number(data.price), // Pastikan number
    };
    
    console.log('📦 Payload:', payload);
    
    const response = await fetch(`${BACKEND_API}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Backend error:', error);
      
      // Extract error message dari array detail jika ada
      if (error.detail && Array.isArray(error.detail)) {
        const errorMessages = error.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ');
        throw new Error(errorMessages);
      }
      
      throw new Error(error.detail || 'Gagal menambah data');
    }

    const result = await response.json();
    console.log('✅ Data berhasil ditambahkan:', result);
    
    return {
      success: true,
      message: result.message || 'Data berhasil ditambahkan',
      id: result.data,
    };
  } catch (error) {
    console.error('❌ Error adding komoditas:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menambah data',
    };
  }
};

/**
 * Update data komoditas di database
 */
export const updateKomoditas = async (
  id: number,
  data: AddKomoditasData
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('📤 Updating data:', { id, data });
    
    const response = await fetch(`${BACKEND_API}/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commodity_name: data.commodity_name,
        market_location: data.market_location,
        unit: data.unit,
        price: data.price,
        date: data.date || undefined,
      }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Backend error:', error);
      throw new Error(error.detail || 'Gagal mengupdate data');
    }

    const result = await response.json();
    console.log('✅ Data berhasil diupdate:', result);
    
    return {
      success: true,
      message: result.message || 'Data berhasil diupdate',
    };
  } catch (error) {
    console.error('❌ Error updating komoditas:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal mengupdate data',
    };
  }
};

/**
 * Hapus data komoditas dari database
 */
export const deleteKomoditas = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${BACKEND_API}/delete/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Gagal menghapus data');
    }

    const result = await response.json();
    console.log('✅ Data berhasil dihapus:', result);
    
    return {
      success: true,
      message: result.message || 'Data berhasil dihapus',
    };
  } catch (error) {
    console.error('❌ Error deleting komoditas:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menghapus data',
    };
  }
};

/**
 * Manual sync data dari API ke database
 */
export const syncKomoditasFromAPI = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${BACKEND_API}/sync`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Gagal sync data dari API');
    }

    const result = await response.json();
    console.log('✅ Sync berhasil:', result);
    
    return {
      success: true,
      message: result.message || 'Data berhasil di-sync dari API',
    };
  } catch (error) {
    console.error('❌ Error syncing data:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal sync data',
    };
  }
};
