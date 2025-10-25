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
 * Fetch data komoditas dari API Disdagkopukm Wonosobo
 * Menggunakan endpoint produk-komoditas
 */
export const fetchKomoditas = async (): Promise<Komoditas[]> => {
  try {
    const response = await fetch(`${API_BASE}/produk-komoditas`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("📦 Raw produk-komoditas response:", data);
    
    // Cek struktur response dan extract data
    let komoditasData: any[] = [];
    
    if (Array.isArray(data)) {
      komoditasData = data;
    } else if (data.data && Array.isArray(data.data)) {
      komoditasData = data.data;
    } else if (data.success && data.data) {
      komoditasData = Array.isArray(data.data) ? data.data : [];
    }
    
    // Log raw data SEBELUM normalisasi dengan FULL DETAIL
    console.log("📋 FULL RAW JSON (sebelum normalisasi):");
    console.log(JSON.stringify(komoditasData, null, 2));
    
    if (komoditasData.length > 0) {
      console.log("\n🔍 FIRST ITEM detail:");
      console.log("Full object:", komoditasData[0]);
      console.log("All keys:", Object.keys(komoditasData[0]));
      console.log("All entries:", Object.entries(komoditasData[0]));
    }
    
    // Normalize data
    const normalized = komoditasData.map(normalizeKomoditas);
    
    console.log(`\n✅ Total ${normalized.length} komoditas dari produk-komoditas`);
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
    const response = await fetch(`${API_BASE}/produk/${id}`);
    
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
 * Fetch semua data komoditas dari berbagai endpoint
 * Menggabungkan data dari produk-komoditas dan produk/{id}
 */
export const fetchAllKomoditas = async (): Promise<Komoditas[]> => {
  try {
    console.log("🔄 Mengambil data dari semua endpoint...");
    
    // 1. Fetch data dengan HARGA dari /produk-komoditas
    const komoditasWithPrice = await fetchKomoditas();
    console.log(`📦 Data DENGAN HARGA dari produk-komoditas: ${komoditasWithPrice.length} items`);
    
    // 2. Fetch daftar produk master (tanpa harga)
    console.log("📋 Fetching master data produk...");
    const cabaiData = await fetchProdukById(1);
    const kubisData = await fetchProdukById(2);
    
    // 3. Gabungkan tanpa duplikasi
    const allData: Komoditas[] = [...komoditasWithPrice];
    const existingNames = new Set(komoditasWithPrice.map(k => k.nama?.toLowerCase() || ''));
    
    // Tambahkan produk master yang belum ada
    [...cabaiData, ...kubisData].forEach(item => {
      const nameLower = (item.nama || '').toLowerCase();
      if (nameLower && !existingNames.has(nameLower)) {
        allData.push(item);
        existingNames.add(nameLower);
        console.log(`✓ Tambah produk master: ${item.nama} (ID: ${item.id}, Harga: ${item.harga || 'N/A'})`);
      } else {
        console.log(`⚠️ Skip duplikat: ${item.nama}`);
      }
    });
    
    console.log(`\n✅ Total ${allData.length} komoditas (gabungan)`);
    console.log("📦 Final data:", allData);
    
    return allData;
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
