import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  CloudRain, 
  TrendingUp, 
  Mountain, 
  MapPin,
  ArrowRight,
  AlertTriangle,
  Thermometer,
  Wind,
  Eye
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  // Data cuaca per kecamatan (sample data)
  const weatherByDistrict = [
    { name: 'Wonosobo Kota', temp: '24°C', condition: 'Berawan', risk: 'Rendah' },
    { name: 'Kertek', temp: '22°C', condition: 'Hujan Ringan', risk: 'Sedang' },
    { name: 'Garung', temp: '23°C', condition: 'Cerah', risk: 'Rendah' },
    { name: 'Leksono', temp: '20°C', condition: 'Dingin', risk: 'Tinggi' },
    { name: 'Kalibawang', temp: '18°C', condition: 'Berkabut', risk: 'Tinggi' }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Tinggi': return 'text-red-600 bg-red-100';
      case 'Sedang': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Monitoring</h1>
          <p className="text-gray-600 mt-1">Sistem Monitoring Pertanian Kabupaten Wonosobo</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>Wonosobo, Jawa Tengah</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kecamatan</p>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suhu Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900">22°C</p>
              </div>
              <Thermometer className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Komoditas</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Akses Gratis</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('weather')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CloudRain className="w-5 h-5 text-blue-600" />
              </div>
              <span>Prediksi Cuaca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Pantau kondisi cuaca real-time dan prediksi untuk setiap kecamatan dan desa di Wonosobo
            </p>
            <Button variant="outline" className="w-full group">
              <span>Lihat Detail</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('price-prediction')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span>Prediksi Harga</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Analisis tren harga komoditas pertanian untuk membantu keputusan penjualan
            </p>
            <Button variant="outline" className="w-full group">
              <span>Lihat Detail</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('slope-analysis')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Mountain className="w-5 h-5 text-red-600" />
              </div>
              <span>Analisis Lereng</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Monitor risiko longsor dan stabilitas lereng untuk keamanan aktivitas pertanian
            </p>
            <Button variant="outline" className="w-full group">
              <span>Lihat Detail</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Weather Overview per District */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ringkasan Cuaca per Kecamatan</span>
            <Button variant="outline" size="sm" onClick={() => onNavigate('weather')}>
              <Eye className="w-4 h-4 mr-2" />
              Lihat Semua
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weatherByDistrict.map((district, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{district.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(district.risk)}`}>
                    {district.risk}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Thermometer className="w-4 h-4" />
                    <span>{district.temp}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Wind className="w-4 h-4" />
                    <span>{district.condition}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notice for Public Access */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Akses Gratis untuk Semua</h3>
              <p className="text-green-800 mb-3">
                Sistem EcoScope Wonosobo dapat diakses secara gratis tanpa perlu registrasi. 
                Semua fitur prediksi cuaca, harga, dan analisis lereng tersedia untuk mendukung petani lokal.
              </p>
              <p className="text-sm text-green-700">
                💡 Tip: Bookmark halaman ini untuk akses yang lebih mudah di kemudian hari
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}