// Mock API Service untuk development tanpa backend
export class MockAPIService {
  static BASE_URL = "http://localhost:8000/api";

  static async fetchWeatherData(adm4Code: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`🌤️ Mock: Fetching weather for ${adm4Code}`);
    
    return {
      success: true,
      data: {
        location: {
          province: "Jawa Tengah",
          regency: "Wonosobo", 
          district: "Wonosobo",
          village: this.getLocationName(adm4Code),
          coordinates: { lat: -7.36, lon: 109.90 }
        },
        forecast: this.generateWeatherForecast(),
        updated_at: new Date().toISOString()
      },
      source: "Mock Data (Backend not available)"
    };
  }

  static async fetchPrices(commodity?: string, source = "all") {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`💰 Mock: Fetching prices for ${commodity || 'all commodities'}`);
    
    return {
      success: true,
      data: {
        bapanas: {
          data: [
            {
              komoditas: "Beras Premium",
              harga: Math.round(15800 + (Math.random() - 0.5) * 2000),
              satuan: "kg",
              tanggal: new Date().toISOString().split('T')[0],
              provinsi: "Jawa Tengah",
              kota: "Wonosobo"
            },
            {
              komoditas: "Cabai Merah Keriting",
              harga: Math.round(48000 + (Math.random() - 0.5) * 8000),
              satuan: "kg", 
              tanggal: new Date().toISOString().split('T')[0],
              provinsi: "Jawa Tengah",
              kota: "Wonosobo"
            },
            {
              komoditas: "Bawang Merah",
              harga: Math.round(32000 + (Math.random() - 0.5) * 5000),
              satuan: "kg",
              tanggal: new Date().toISOString().split('T')[0],
              provinsi: "Jawa Tengah", 
              kota: "Wonosobo"
            },
            {
              komoditas: "Jagung Pipilan Kering",
              harga: Math.round(6500 + (Math.random() - 0.5) * 1000),
              satuan: "kg",
              tanggal: new Date().toISOString().split('T')[0],
              provinsi: "Jawa Tengah",
              kota: "Wonosobo"
            }
          ]
        },
        local_markets: this.generateLocalMarketData()
      },
      updated_at: new Date().toISOString(),
      source: "Mock Data (Backend not available)"
    };
  }

  static async fetchPriceHistory(commodity: string, days = 30) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log(`📈 Mock: Fetching price history for ${commodity}`);
    
    const basePrices: { [key: string]: number } = {
      beras: 15000,
      cabai: 45000, 
      bawang_merah: 30000,
      jagung: 6000
    };
    
    const basePrice = basePrices[commodity] || 15000;
    const history = [];
    const predictions = [];
    
    // Generate historical data
    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.3;
      
      history.push({
        tanggal: date.toISOString().split('T')[0],
        harga: Math.round(basePrice * (1 + variation)),
        satuan: "kg"
      });
    }
    
    // Generate predictions
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const trend = (Math.random() - 0.5) * 0.15;
      
      predictions.push({
        tanggal: date.toISOString().split('T')[0],
        harga_prediksi: Math.round(basePrice * (1 + trend)),
        satuan: "kg",
        confidence: 0.65 + Math.random() * 0.3
      });
    }
    
    return {
      success: true,
      data: {
        commodity,
        history,
        predictions
      },
      source: "Mock Data with AI Simulation"
    };
  }

  static async fetchLocalMarkets() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("🏪 Mock: Fetching local markets");
    
    return this.generateLocalMarketData();
  }

  private static generateWeatherForecast() {
    const forecast = [];
    const weatherTypes = [
      { code: "1", desc: "Cerah Berawan" },
      { code: "3", desc: "Berawan" },
      { code: "4", desc: "Berawan Tebal" },
      { code: "60", desc: "Hujan Ringan" }
    ];
    
    for (let day = 0; day < 7; day++) {
      const dayForecast = [];
      
      for (let hour = 6; hour < 24; hour += 3) {
        const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        const baseTemp = 22 + (hour > 12 ? Math.random() * 6 : Math.random() * 4);
        
        dayForecast.push({
          local_datetime: this.getDateTimeString(day, hour),
          weather_code: weather.code,
          weather_desc: weather.desc,
          t: Math.round(baseTemp + (Math.random() - 0.5) * 4),
          hu: Math.round(60 + Math.random() * 30),
          wind_speed: Math.round(Math.random() * 10),
          wind_direction: Math.round(Math.random() * 360),
          visibility: Math.round(5 + Math.random() * 5)
        });
      }
      
      forecast.push(dayForecast);
    }
    
    return forecast;
  }

  private static generateLocalMarketData() {
    const markets = [
      {
        nama_pasar: "Pasar Wage Wonosobo",
        alamat: "Jl. Pemuda, Wonosobo",
        komoditas: [
          { 
            nama: "Beras IR64", 
            harga: Math.round(12000 + (Math.random() - 0.5) * 2000), 
            satuan: "kg", 
            stok: "Tersedia" 
          },
          { 
            nama: "Cabai Rawit", 
            harga: Math.round(65000 + (Math.random() - 0.5) * 10000), 
            satuan: "kg", 
            stok: Math.random() > 0.3 ? "Tersedia" : "Terbatas" 
          },
          { 
            nama: "Bawang Merah Lokal", 
            harga: Math.round(28000 + (Math.random() - 0.5) * 5000), 
            satuan: "kg", 
            stok: "Tersedia" 
          },
          { 
            nama: "Tomat", 
            harga: Math.round(8000 + (Math.random() - 0.5) * 2000), 
            satuan: "kg", 
            stok: "Tersedia" 
          }
        ],
        jam_operasional: "05:00 - 17:00",
        hari_pasar: "Senin, Kamis"
      },
      {
        nama_pasar: "Pasar Kejajar", 
        alamat: "Kejajar, Wonosobo",
        komoditas: [
          { 
            nama: "Kentang Dieng", 
            harga: Math.round(15000 + (Math.random() - 0.5) * 3000), 
            satuan: "kg", 
            stok: "Melimpah" 
          },
          { 
            nama: "Wortel", 
            harga: Math.round(12000 + (Math.random() - 0.5) * 2000), 
            satuan: "kg", 
            stok: "Tersedia" 
          },
          { 
            nama: "Kubis", 
            harga: Math.round(5000 + (Math.random() - 0.5) * 1000), 
            satuan: "kg", 
            stok: "Tersedia" 
          },
          { 
            nama: "Brokoli", 
            harga: Math.round(18000 + (Math.random() - 0.5) * 4000), 
            satuan: "kg", 
            stok: Math.random() > 0.4 ? "Tersedia" : "Terbatas" 
          }
        ],
        jam_operasional: "04:00 - 16:00",
        hari_pasar: "Selasa, Jumat"
      },
      {
        nama_pasar: "Pasar Sapuran",
        alamat: "Sapuran, Wonosobo", 
        komoditas: [
          { 
            nama: "Jagung Manis", 
            harga: Math.round(4000 + (Math.random() - 0.5) * 800), 
            satuan: "kg", 
            stok: "Melimpah" 
          },
          { 
            nama: "Kacang Tanah", 
            harga: Math.round(22000 + (Math.random() - 0.5) * 4000), 
            satuan: "kg", 
            stok: "Tersedia" 
          },
          { 
            nama: "Ubi Jalar", 
            harga: Math.round(6000 + (Math.random() - 0.5) * 1000), 
            satuan: "kg", 
            stok: "Tersedia" 
          },
          { 
            nama: "Singkong", 
            harga: Math.round(3500 + (Math.random() - 0.5) * 700), 
            satuan: "kg", 
            stok: "Melimpah" 
          }
        ],
        jam_operasional: "05:30 - 17:30",
        hari_pasar: "Rabu, Sabtu"
      }
    ];

    return {
      data: markets,
      total_pasar: markets.length,
      updated_at: new Date().toISOString(),
      source: "Mock Local Market Data"
    };
  }

  private static getDateTimeString(dayOffset: number, hour: number): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return `${date.toISOString().split('T')[0]} ${hour.toString().padStart(2, '0')}:00:00`;
  }

  private static getLocationName(adm4Code: string): string {
    const locations: { [key: string]: string } = {
      "33.07.01.2001": "Desa Kaligowong",
      "33.07.01.2002": "Desa Sumbersari", 
      "33.07.02.2001": "Desa Gondowulan",
      "33.07.03.2001": "Desa Bogoran",
      "33.07.09.1002": "Kelurahan Tawangsari",
      // Add more as needed
    };
    
    return locations[adm4Code] || "Desa/Kelurahan Wonosobo";
  }
}

// Development mode flag
export const IS_DEVELOPMENT = true;
export const BACKEND_AVAILABLE = false;