/**
 * Market API Service - Real-time price data from Disdagkopukm Wonosobo
 * Base URL: https://disdagkopukm.wonosobokab.go.id/api/
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface MarketPrice {
  commodity_name: string;
  category: string;
  unit: string;
  price: number;
  market_location: string;
  date: string;
  source: string;
}

export interface RealtimeResponse {
  success: boolean;
  total: number;
  data: MarketPrice[];
  timestamp?: string;
  error?: string;
}

export interface KomoditasItem {
  id?: number;
  nama?: string;
  nama_komoditas?: string;
  kategori?: string;
  nama_kategori?: string;
  satuan?: string;
  harga?: number | string;
  harga_eceran?: number | string;
  lokasi?: string;
  pasar?: string;
  tanggal?: string;
  updated_at?: string;
}

export interface ProdukItem {
  id?: number;
  nama?: string;
  nama_produk?: string;
  kategori?: string;
  satuan?: string;
  harga?: number | string;
  harga_jual?: number | string;
  lokasi?: string;
  tanggal?: string;
  updated_at?: string;
}

/**
 * Fetch real-time market prices from all endpoints
 */
export async function fetchRealtimeMarketPrices(): Promise<RealtimeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/market/realtime`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching realtime market prices:', error);
    return {
      success: false,
      total: 0,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Fetch komoditas data from API
 */
export async function fetchKomoditas(): Promise<{
  success: boolean;
  total: number;
  data: KomoditasItem[];
  source: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/market/realtime/komoditas`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching komoditas:', error);
    return {
      success: false,
      total: 0,
      data: [],
      source: ''
    };
  }
}

/**
 * Fetch produk komoditas data from API
 */
export async function fetchProdukKomoditas(): Promise<{
  success: boolean;
  total: number;
  data: any[];
  source: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/market/realtime/produk-komoditas`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching produk-komoditas:', error);
    return {
      success: false,
      total: 0,
      data: [],
      source: ''
    };
  }
}

/**
 * Fetch produk data from API
 */
export async function fetchProduk(): Promise<{
  success: boolean;
  total: number;
  data: ProdukItem[];
  source: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/market/realtime/produk`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching produk:', error);
    return {
      success: false,
      total: 0,
      data: [],
      source: ''
    };
  }
}

/**
 * Fetch market prices from local database with filters
 */
export async function fetchLocalMarketPrices(params?: {
  commodity?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<RealtimeResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.commodity) queryParams.append('commodity', params.commodity);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/market/list?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching local market prices:', error);
    return {
      success: false,
      total: 0,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Sync market data from API to local database
 */
export async function syncMarketData(): Promise<{
  message: string;
  total_fetched?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/market/sync`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error syncing market data:', error);
    return {
      message: 'Sync failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Format price to Indonesian Rupiah
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Parse price from string or number
 */
export function parsePrice(value: any): number {
  try {
    if (typeof value === 'string') {
      // Remove "Rp", ".", and replace "," with "."
      value = value.replace(/Rp|\.|\s/g, '').replace(',', '.');
    }
    return parseFloat(value) || 0;
  } catch {
    return 0;
  }
}

/**
 * Group prices by commodity
 */
export function groupPricesByCommodity(prices: MarketPrice[]): Map<string, MarketPrice[]> {
  const grouped = new Map<string, MarketPrice[]>();
  
  prices.forEach(price => {
    const commodity = price.commodity_name;
    if (!grouped.has(commodity)) {
      grouped.set(commodity, []);
    }
    grouped.get(commodity)?.push(price);
  });
  
  return grouped;
}

/**
 * Get latest price for a commodity
 */
export function getLatestPrice(prices: MarketPrice[], commodity: string): MarketPrice | null {
  const commodityPrices = prices.filter(
    p => p.commodity_name.toLowerCase().includes(commodity.toLowerCase())
  );
  
  if (commodityPrices.length === 0) return null;
  
  // Sort by date descending
  commodityPrices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return commodityPrices[0];
}

/**
 * Calculate price trend (percentage change)
 */
export function calculatePriceTrend(prices: MarketPrice[]): {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
} {
  if (prices.length < 2) {
    return {
      current: prices[0]?.price || 0,
      previous: 0,
      change: 0,
      changePercent: 0,
      trend: 'stable'
    };
  }
  
  // Sort by date
  const sorted = [...prices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const current = sorted[0].price;
  const previous = sorted[1].price;
  const change = current - previous;
  const changePercent = (change / previous) * 100;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercent > 0.5) trend = 'up';
  else if (changePercent < -0.5) trend = 'down';
  
  return {
    current,
    previous,
    change,
    changePercent,
    trend
  };
}
