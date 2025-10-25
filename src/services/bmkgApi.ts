// src/services/bmkgApi.ts
export interface BMKGLocation {
  adm4: string;
  desa: string;
  kecamatan: string;
  kotkab: string;
  provinsi: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface BMKGForecast {
  datetime: string;
  temperature: number;
  weatherDesc: string;
  humidity: number;
  rain: number;
  windSpeed: number;
  windDir: string;
}

export interface ParsedBMKGData {
  location: BMKGLocation;
  forecasts: BMKGForecast[];
}

/**
 * Kode ADM4 untuk kecamatan-kecamatan di Wonosobo
 */
export const WONOSOBO_ADM4_CODES = {
  WONOSOBO: "31.71.03.1001",
  KERTEK: "31.71.01.1001",
  GARUNG: "31.71.02.1001",
  LEKSONO: "31.71.04.1001",
  KALIWIRO: "31.71.05.1001",
  SUKOHARJO: "31.71.06.1001",
  SAPURAN: "31.71.07.1001",
  KALIBAWANG: "31.71.08.1001",
  KALIKAJAR: "31.71.09.1001",
  KEPIL: "31.71.10.1001",
  MOJOTENGAH: "31.71.11.1001",
  SELOMERTO: "31.71.12.1001",
  WADASLINTANG: "31.71.13.1001",
  WATUMALANG: "31.71.14.1001",
  KEJAJAR: "31.71.15.1001",
} as const;

/**
 * Ambil data prakiraan cuaca langsung dari API BMKG berdasarkan kode adm4.
 */
export async function fetchBMKGDirect(adm4Code: string): Promise<ParsedBMKGData> {
  const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4Code}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gagal memuat data BMKG (${response.status})`);
  }

  const data = await response.json();

  const lokasi = data.lokasi;
  const parameter = data.data[0]?.parameter || [];

  const jamList: BMKGForecast[] = [];

  // Ambil setiap jam data prakiraan
  for (let i = 0; i < parameter.length; i++) {
    const p = parameter[i];
    const id = p.id.toLowerCase();

    if (id === "t") {
      // Suhu
      p.timerange.forEach((t: any, idx: number) => {
        const datetime = t.datetime;
        const temperature = Number(t.value[0]?._text || t.value?._text || 0);

        // Pastikan ada entry-nya dulu
        if (!jamList[idx]) jamList[idx] = {
          datetime,
          temperature,
          weatherDesc: "",
          humidity: 0,
          rain: 0,
          windSpeed: 0,
          windDir: "",
        };
        else jamList[idx].temperature = temperature;
      });
    }

    if (id === "weather") {
      p.timerange.forEach((t: any, idx: number) => {
        const desc = t.value[1]?._text || t.value?._text || "";
        if (!jamList[idx]) jamList[idx] = {
          datetime: t.datetime,
          temperature: 0,
          weatherDesc: desc,
          humidity: 0,
          rain: 0,
          windSpeed: 0,
          windDir: "",
        };
        else jamList[idx].weatherDesc = desc;
      });
    }

    if (id === "hu") {
      p.timerange.forEach((t: any, idx: number) => {
        const hum = Number(t.value?._text || 0);
        if (!jamList[idx]) jamList[idx] = {
          datetime: t.datetime,
          temperature: 0,
          weatherDesc: "",
          humidity: hum,
          rain: 0,
          windSpeed: 0,
          windDir: "",
        };
        else jamList[idx].humidity = hum;
      });
    }

    if (id === "rain") {
      p.timerange.forEach((t: any, idx: number) => {
        const rainVal = Number(t.value?._text || 0);
        if (!jamList[idx]) jamList[idx] = {
          datetime: t.datetime,
          temperature: 0,
          weatherDesc: "",
          humidity: 0,
          rain: rainVal,
          windSpeed: 0,
          windDir: "",
        };
        else jamList[idx].rain = rainVal;
      });
    }

    if (id === "ws") {
      p.timerange.forEach((t: any, idx: number) => {
        const ws = Number(t.value?._text || 0);
        if (!jamList[idx]) jamList[idx] = {
          datetime: t.datetime,
          temperature: 0,
          weatherDesc: "",
          humidity: 0,
          rain: 0,
          windSpeed: ws,
          windDir: "",
        };
        else jamList[idx].windSpeed = ws;
      });
    }

    if (id === "wd") {
      p.timerange.forEach((t: any, idx: number) => {
        const wd = t.value?._text || "";
        if (!jamList[idx]) jamList[idx] = {
          datetime: t.datetime,
          temperature: 0,
          weatherDesc: "",
          humidity: 0,
          rain: 0,
          windSpeed: 0,
          windDir: wd,
        };
        else jamList[idx].windDir = wd;
      });
    }
  }

  return {
    location: lokasi,
    forecasts: jamList,
  };
}

/**
 * Kelompokkan data per hari
 */
export function groupForecastsByDay(forecasts: BMKGForecast[]) {
  const grouped: Record<string, BMKGForecast[]> = {};
  forecasts.forEach((item) => {
    const date = new Date(item.datetime).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });
  return grouped;
}

export function getAverageTemp(list: BMKGForecast[]) {
  if (!list.length) return 0;
  return (
    list.reduce((sum, item) => sum + (item.temperature || 0), 0) / list.length
  ).toFixed(1);
}

export function getTotalRainfall(list: BMKGForecast[]) {
  if (!list.length) return 0;
  return list.reduce((sum, item) => sum + (item.rain || 0), 0);
}

export function getDominantWeather(list: BMKGForecast[]) {
  if (!list.length) return "Tidak ada data";
  const freq: Record<string, number> = {};
  list.forEach((item) => {
    freq[item.weatherDesc] = (freq[item.weatherDesc] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}
