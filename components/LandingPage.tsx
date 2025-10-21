import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Users, TrendingUp, CloudRain, AlertTriangle, ThermometerSun, DollarSign, ArrowRight } from 'lucide-react';

// Data lokasi real Kabupaten Wonosobo dengan koordinat yang akurat
const wonosoboLocations = [
  {
    name: "Wonosobo Kota",
    coordinates: [-7.3667, 109.9000] as [number, number],
    data: {
      slopeRisk: "Sedang",
      weather: "Sejuk, 24°C",
      commodity: "Kentang: Rp 8.500/kg",
      recommendation: "Cocok untuk tanaman dataran tinggi"
    }
  },
  {
    name: "Kertek", 
    coordinates: [-7.2833, 109.8500] as [number, number],
    data: {
      slopeRisk: "Tinggi",
      weather: "Sejuk, 22°C",
      commodity: "Wortel: Rp 12.000/kg", 
      recommendation: "Perhatikan stabilitas lereng"
    }
  },
  {
    name: "Garung",
    coordinates: [-7.3500, 109.8333] as [number, number],
    data: {
      slopeRisk: "Sedang",
      weather: "Sejuk, 23°C", 
      commodity: "Kubis: Rp 6.000/kg",
      recommendation: "Monitoring curah hujan diperlukan"
    }
  },
  {
    name: "Leksono",
    coordinates: [-7.4167, 109.8167] as [number, number],
    data: {
      slopeRisk: "Tinggi",
      weather: "Dingin, 20°C",
      commodity: "Kopi: Rp 28.000/kg",
      recommendation: "Ideal untuk tanaman perkebunan"
    }
  },
  {
    name: "Sukoharjo", 
    coordinates: [-7.4333, 109.9167] as [number, number],
    data: {
      slopeRisk: "Sedang",
      weather: "Sejuk, 24°C",
      commodity: "Bawang Daun: Rp 15.000/kg",
      recommendation: "Area potensial sayuran"
    }
  },
  {
    name: "Selomerto",
    coordinates: [-7.3833, 109.9500] as [number, number],
    data: {
      slopeRisk: "Rendah",
      weather: "Sejuk, 25°C",
      commodity: "Jagung: Rp 5.200/kg",
      recommendation: "Stabil untuk tanaman pangan"
    }
  },
  {
    name: "Kejajar",
    coordinates: [-7.3000, 109.9333] as [number, number],
    data: {
      slopeRisk: "Tinggi", 
      weather: "Dingin, 19°C",
      commodity: "Tembakau: Rp 45.000/kg",
      recommendation: "Cocok untuk tanaman tembakau"
    }
  },
  {
    name: "Mojotengah",
    coordinates: [-7.4000, 109.8667] as [number, number],
    data: {
      slopeRisk: "Sedang",
      weather: "Sejuk, 23°C",
      commodity: "Carica: Rp 8.000/kg",
      recommendation: "Tanaman khas dataran tinggi"
    }
  },
  {
    name: "Sapuran",
    coordinates: [-7.4500, 109.8833] as [number, number],
    data: {
      slopeRisk: "Rendah",
      weather: "Sejuk, 25°C",
      commodity: "Padi: Rp 7.500/kg",
      recommendation: "Area pertanian utama"
    }
  },
  {
    name: "Kalibawang",
    coordinates: [-7.2500, 109.8833] as [number, number],
    data: {
      slopeRisk: "Tinggi",
      weather: "Dingin, 18°C",
      commodity: "Strawberry: Rp 25.000/kg",
      recommendation: "Ideal untuk buah dataran tinggi"
    }
  },
  {
    name: "Kaliwiro",
    coordinates: [-7.3167, 109.8000] as [number, number],
    data: {
      slopeRisk: "Sedang",
      weather: "Sejuk, 22°C",
      commodity: "Tomat: Rp 10.000/kg",
      recommendation: "Perhatikan drainase area"
    }
  },
  {
    name: "Watumalang",
    coordinates: [-7.2667, 109.9167] as [number, number],
    data: {
      slopeRisk: "Tinggi",
      weather: "Dingin, 19°C",
      commodity: "Lettuce: Rp 18.000/kg",
      recommendation: "Cocok untuk sayuran premium"
    }
  }
];

interface LandingPageProps {
  onLoginClick: () => void;
  onGoToApp: () => void;
}

export function LandingPage({ onLoginClick, onGoToApp }: LandingPageProps) {
  const [selectedLocation, setSelectedLocation] = React.useState<typeof wonosoboLocations[0] | null>(null);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Tinggi': return 'bg-red-500';
      case 'Sedang': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Tinggi': return <AlertTriangle className="w-4 h-4" />;
      case 'Sedang': return <ThermometerSun className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div> */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">EcoScope Wonosobo</h1>
              <p className="text-sm text-gray-600">Sistem Monitoring Pertanian Terpadu</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={onGoToApp} className="bg-green-600 hover:bg-green-700">
              <ArrowRight className="w-4 h-4 mr-2" />
              Mulai Monitoring
            </Button>
            <Button onClick={onLoginClick} variant="outline">
              Login Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Monitoring Pertanian Real-Time Kabupaten Wonosobo
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Pantau risiko lereng, prediksi cuaca, dan harga komoditas pertanian secara interaktif tanpa perlu mendaftar. 
            Klik pada titik lokasi di peta untuk melihat data terkini dari setiap kecamatan.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={onGoToApp} size="lg" className="bg-green-600 hover:bg-green-700">
              <ArrowRight className="w-5 h-5 mr-2" />
              Akses Gratis Sekarang
            </Button>
          </div>
        </div>

        {/* Statistik Ringkas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900">2,147 Petani</h3>
              <p className="text-sm text-gray-600">Menggunakan sistem</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold text-gray-900">18 Komoditas</h3>
              <p className="text-sm text-gray-600">Dipantau harganya</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CloudRain className="w-8 h-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold text-gray-900">15 Kecamatan</h3>
              <p className="text-sm text-gray-600">Monitoring cuaca</p>
            </CardContent>
          </Card>
        </div>

        {/* Layout Bersampingan: Peta dan Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Peta Visual Interaktif - Kiri */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6">Peta Interaktif Kabupaten Wonosobo</h3>
            <Card>
              <CardContent className="p-6">
                <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-6 min-h-[600px]">
                  {/* Background peta */}
                  <div className="absolute inset-0 bg-green-200/30 rounded-lg"></div>
                  
                  {/* Plotkan lokasi dengan posisi relatif berdasarkan koordinat real */}
                  {wonosoboLocations.map((location, index) => {
                    // Normalisasi koordinat berdasarkan boundary Kabupaten Wonosobo
                    // Lat: -7.50 to -7.20, Lng: 109.75 to 109.95
                    const latRange = [-7.50, -7.20];
                    const lngRange = [109.75, 109.95];
                    
                    const normalizedLat = ((location.coordinates[0] - latRange[1]) / (latRange[0] - latRange[1])) * 100;
                    const normalizedLng = ((location.coordinates[1] - lngRange[0]) / (lngRange[1] - lngRange[0])) * 100;
                    
                    return (
                      <div
                        key={index}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 ${
                          selectedLocation?.name === location.name ? 'scale-150 z-20' : 'hover:z-10'
                        }`}
                        style={{
                          left: `${Math.max(8, Math.min(92, normalizedLng))}%`,
                          top: `${Math.max(8, Math.min(92, normalizedLat))}%`
                        }}
                        onClick={() => setSelectedLocation(location)}
                      >
                        <div className={`w-6 h-6 rounded-full ${getRiskColor(location.data.slopeRisk)} border-2 border-white shadow-lg flex items-center justify-center pulse-animation`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        {/* Label nama kecamatan */}
                        <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-white px-2 py-1 rounded-full shadow-md border transition-all duration-200 ${
                          selectedLocation?.name === location.name ? 'visible opacity-100' : 'invisible opacity-0'
                        }`}>
                          {location.name}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-md">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Tingkat Risiko Lereng</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 border border-white"></div>
                        <span className="text-sm text-gray-600">Rendah</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 border border-white"></div>
                        <span className="text-sm text-gray-600">Sedang</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 border border-white"></div>
                        <span className="text-sm text-gray-600">Tinggi</span>
                      </div>
                    </div>
                  </div>

                  {/* Instruksi */}
                  <div className="absolute top-4 right-4 bg-blue-50 p-3 rounded-lg shadow-md max-w-xs">
                    <p className="text-sm text-blue-800">
                      💡 Klik titik untuk data detail
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Area Detail Data - Kanan */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6">Data Monitoring Terkini</h3>
            {selectedLocation ? (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedLocation.name}</h4>
                    <p className="text-gray-600">
                      Koordinat: {selectedLocation.coordinates[0].toFixed(4)}, {selectedLocation.coordinates[1].toFixed(4)}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Risiko Lereng */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-full ${getRiskColor(selectedLocation.data.slopeRisk)} flex items-center justify-center text-white`}>
                          {getRiskIcon(selectedLocation.data.slopeRisk)}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Risiko Lereng</h5>
                          <p className={`font-semibold ${
                            selectedLocation.data.slopeRisk === 'Tinggi' ? 'text-red-600' :
                            selectedLocation.data.slopeRisk === 'Sedang' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {selectedLocation.data.slopeRisk}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cuaca */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <CloudRain className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Cuaca Terkini</h5>
                          <p className="text-gray-900 font-medium">{selectedLocation.data.weather}</p>
                        </div>
                      </div>
                    </div>

                    {/* Harga Komoditas */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Harga Komoditas</h5>
                          <p className="text-gray-900 font-medium">{selectedLocation.data.commodity}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rekomendasi */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Rekomendasi</h5>
                          <p className="text-blue-800">{selectedLocation.data.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Reset */}
                  <div className="text-center mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedLocation(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Tutup Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-gray-300 h-[600px] flex items-center justify-center">
                <CardContent className="p-8 text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Pilih Lokasi pada Peta</h4>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Klik pada salah satu titik lokasi di peta sebelah kiri untuk melihat data monitoring lengkap dari kecamatan tersebut
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 mb-8 bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Akses Gratis Tanpa Registrasi!
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Nikmati akses penuh ke sistem monitoring pertanian EcoScope Wonosobo tanpa perlu mendaftar akun. 
            Semua fitur prediksi dan analisis tersedia secara gratis untuk mendukung petani lokal.
          </p>
          <Button 
            onClick={onGoToApp}
            size="lg"
            className="bg-green-600 hover:bg-green-700 px-8 py-3"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Mulai Monitoring Sekarang
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {/* <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div> */}
            <span className="text-lg font-semibold">EcoScope Wonosobo</span>
          </div>
          <p className="text-gray-400">
            Platform monitoring pertanian terpadu untuk Kabupaten Wonosobo, Jawa Tengah
          </p>
        </div>
      </footer>
    </div>
  );
}