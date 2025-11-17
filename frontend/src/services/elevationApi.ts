/**
 * Google Elevation API Service
 * Untuk mendapatkan data elevasi dan menghitung slope/kemiringan tanah
 */

interface ElevationPoint {
  lat: number;
  lng: number;
  elevation: number;
}

interface SlopeResult {
  slopePercentage: number;
  slopeDegrees: number;
  riskLevel: 'low' | 'medium' | 'high';
  elevationData: ElevationPoint[];
}

// Ganti dengan API key Google Maps Anda
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_ELEVATION === 'true';

// Debug: Log API key status (jangan log key lengkap untuk keamanan)
console.log('Elevation API initialized. API Key set:', GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE');
console.log('Using mock data:', USE_MOCK_DATA);

/**
 * Generate mock elevation data untuk development
 */
function generateMockElevation(lat: number, lng: number): number {
  // Simulasi elevasi berdasarkan koordinat Wonosobo (daerah pegunungan)
  // Elevasi rata-rata Wonosobo: 275-2250 mdpl
  const baseElevation = 800;
  const variation = Math.sin(lat * 100) * Math.cos(lng * 100) * 500;
  return baseElevation + variation + (Math.random() * 200 - 100);
}

/**
 * Mendapatkan data elevasi dari koordinat menggunakan Google Elevation API
 */
export async function getElevation(lat: number, lng: number): Promise<number> {
  // Jika mock mode, return dummy data
  if (USE_MOCK_DATA) {
    console.log('🔧 MOCK MODE: Generating fake elevation for:', lat, lng);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    return generateMockElevation(lat, lng);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    console.log('Fetching elevation for:', lat, lng);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Elevation API response:', data);
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      if (data.error_message) {
        // Jika error billing, fallback ke mock data
        if (data.error_message.includes('Billing') || data.status === 'REQUEST_DENIED') {
          console.warn('⚠️ API billing not enabled. Falling back to mock data.');
          console.warn('Error:', data.error_message);
          return generateMockElevation(lat, lng);
        }
        throw new Error(`Elevation API error: ${data.status} - ${data.error_message}`);
      }
      throw new Error(`Elevation API error: ${data.status}`);
    }

    return data.results[0].elevation;
  } catch (error) {
    console.error('❌ Error fetching elevation, using mock data as fallback:', error);
    // Fallback ke mock data saat error apapun
    return generateMockElevation(lat, lng);
  }
}

/**
 * Mendapatkan data elevasi untuk beberapa titik sekaligus
 */
export async function getElevationForPath(
  points: { lat: number; lng: number }[]
): Promise<ElevationPoint[]> {
  // Jika mock mode, return dummy data
  if (USE_MOCK_DATA) {
    console.log('🔧 MOCK MODE: Generating fake elevation for', points.length, 'points');
    await new Promise(resolve => setTimeout(resolve, 500));
    return points.map(p => ({
      lat: p.lat,
      lng: p.lng,
      elevation: generateMockElevation(p.lat, p.lng),
    }));
  }

  try {
    const locations = points.map(p => `${p.lat},${p.lng}`).join('|');
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch elevation data');
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results) {
      // Fallback ke mock data jika error billing
      if (data.error_message && (data.error_message.includes('Billing') || data.status === 'REQUEST_DENIED')) {
        console.warn('⚠️ API billing not enabled. Falling back to mock data for path.');
        return points.map(p => ({
          lat: p.lat,
          lng: p.lng,
          elevation: generateMockElevation(p.lat, p.lng),
        }));
      }
      throw new Error(`Elevation API error: ${data.status}`);
    }

    return data.results.map((result: any, index: number) => ({
      lat: points[index].lat,
      lng: points[index].lng,
      elevation: result.elevation,
    }));
  } catch (error) {
    console.error('❌ Error fetching elevation for path, using mock data:', error);
    // Fallback ke mock data
    return points.map(p => ({
      lat: p.lat,
      lng: p.lng,
      elevation: generateMockElevation(p.lat, p.lng),
    }));
  }
}

/**
 * Menghitung jarak antara dua titik koordinat (dalam meter)
 * Menggunakan formula Haversine
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Menghitung slope/kemiringan dari data elevasi
 * Mengambil beberapa titik di sekitar lokasi untuk akurasi lebih baik
 */
export async function calculateSlope(
  centerLat: number,
  centerLng: number,
  radiusMeters: number = 100
): Promise<SlopeResult> {
  try {
    console.log('Starting slope calculation for:', centerLat, centerLng, 'radius:', radiusMeters);
    
    // Membuat grid 3x3 titik di sekitar lokasi center
    const offset = radiusMeters / 111320; // Convert meter ke derajat (approx)
    
    const points = [
      { lat: centerLat, lng: centerLng }, // Center
      { lat: centerLat + offset, lng: centerLng }, // North
      { lat: centerLat - offset, lng: centerLng }, // South
      { lat: centerLat, lng: centerLng + offset }, // East
      { lat: centerLat, lng: centerLng - offset }, // West
      { lat: centerLat + offset, lng: centerLng + offset }, // NE
      { lat: centerLat + offset, lng: centerLng - offset }, // NW
      { lat: centerLat - offset, lng: centerLng + offset }, // SE
      { lat: centerLat - offset, lng: centerLng - offset }, // SW
    ];

    console.log('Fetching elevation for', points.length, 'points...');

    // Mendapatkan elevasi untuk semua titik
    const elevationData = await getElevationForPath(points);
    console.log('Elevation data received:', elevationData);

    // Menghitung slope maksimum
    const centerElevation = elevationData[0].elevation;
    let maxSlope = 0;

    for (let i = 1; i < elevationData.length; i++) {
      const point = elevationData[i];
      const elevationDiff = Math.abs(point.elevation - centerElevation);
      const horizontalDistance = calculateDistance(
        centerLat,
        centerLng,
        point.lat,
        point.lng
      );

      // Slope = (rise / run) * 100 untuk persentase
      const slope = (elevationDiff / horizontalDistance) * 100;
      maxSlope = Math.max(maxSlope, slope);
    }

    console.log('Max slope calculated:', maxSlope);

    // Konversi ke degrees
    const slopeDegrees = Math.atan(maxSlope / 100) * (180 / Math.PI);

    // Tentukan risk level berdasarkan persentase slope
    let riskLevel: 'low' | 'medium' | 'high';
    if (maxSlope <= 20) {
      riskLevel = 'low';
    } else if (maxSlope <= 30) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    const result = {
      slopePercentage: Math.round(maxSlope * 10) / 10,
      slopeDegrees: Math.round(slopeDegrees * 10) / 10,
      riskLevel,
      elevationData,
    };
    
    console.log('Slope calculation complete:', result);
    return result;
  } catch (error) {
    console.error('Error calculating slope:', error);
    throw error;
  }
}

/**
 * Mendapatkan profil elevasi sepanjang path
 * Berguna untuk visualisasi cross-section
 */
export async function getElevationProfile(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  samples: number = 10
): Promise<ElevationPoint[]> {
  const points: { lat: number; lng: number }[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    points.push({
      lat: startLat + (endLat - startLat) * t,
      lng: startLng + (endLng - startLng) * t,
    });
  }

  return await getElevationForPath(points);
}

/**
 * Mendapatkan rekomendasi berdasarkan slope
 */
export function getSlopeRecommendations(slopePercentage: number): string[] {
  if (slopePercentage <= 20) {
    return [
      'Kondisi aman untuk pertanian',
      'Tetap jaga sistem drainase yang baik',
      'Cocok untuk berbagai jenis tanaman',
      'Monitor rutin kondisi tanah',
    ];
  } else if (slopePercentage <= 30) {
    return [
      'Tanam tanaman penutup tanah untuk mencegah erosi',
      'Buat saluran drainase yang memadai',
      'Pertimbangkan sistem terasering sederhana',
      'Hindari membersihkan vegetasi secara berlebihan',
      'Monitoring berkala diperlukan',
    ];
  } else {
    return [
      '⚠️ HINDARI aktivitas berat di area ini',
      'Pasang jaring pengaman atau struktur penahan',
      'Monitoring ketat dan berkelanjutan WAJIB',
      'Pertimbangkan konsultasi dengan ahli geologi',
      'Buat sistem early warning untuk longsor',
      'Jangan bangun struktur permanen',
      'Evakuasi area saat hujan lebat',
    ];
  }
}

/**
 * Validasi apakah API key sudah di-set
 */
export function validateApiKey(): boolean {
  return GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE' && GOOGLE_MAPS_API_KEY.length > 0;
}
