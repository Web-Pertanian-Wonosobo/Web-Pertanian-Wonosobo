import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Search,
  Filter,
  BarChart3,
  MapPin,
  Mountain,
  Camera,
  Satellite,
  Upload,
  Shield,
  Clock,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [searchUser, setSearchUser] = useState('');
  const [searchData, setSearchData] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [uploadType, setUploadType] = useState<'drone' | 'satellite'>('drone');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data for admin dashboard
  const dashboardStats = {
    totalUsers: 2456,
    activeFarmers: 1892,
    dataPoints: 15678,
    alertsToday: 7
  };

  const recentAlerts = [
    { id: 1, type: 'slope', location: 'Desa Kedungbanteng', severity: 'high', time: '2 jam lalu' },
    { id: 2, type: 'weather', location: 'Kec. Sumbang', severity: 'medium', time: '4 jam lalu' },
    { id: 3, type: 'price', location: 'Pasar Wage', severity: 'low', time: '6 jam lalu' }
  ];

  const users = [
    { 
      id: 1, 
      name: 'Budi Santoso', 
      email: 'budi@gmail.com', 
      role: 'farmer', 
      location: 'Sumbang', 
      status: 'active',
      joinDate: '15 Jan 2025',
      lastLogin: '26 Jul 2025'
    },
    { 
      id: 2, 
      name: 'Siti Aminah', 
      email: 'siti@gmail.com', 
      role: 'farmer', 
      location: 'Kedungbanteng', 
      status: 'active',
      joinDate: '20 Jan 2025',
      lastLogin: '25 Jul 2025'
    },
    { 
      id: 3, 
      name: 'Ahmad Solichin', 
      email: 'ahmad@gmail.com', 
      role: 'admin', 
      location: 'Purwokerto', 
      status: 'active',
      joinDate: '01 Jan 2025',
      lastLogin: '26 Jul 2025'
    },
    { 
      id: 4, 
      name: 'Rina Dewi', 
      email: 'rina@gmail.com', 
      role: 'farmer', 
      location: 'Kembaran', 
      status: 'inactive',
      joinDate: '10 Feb 2025',
      lastLogin: '20 Jul 2025'
    }
  ];

  const agriculturalData = [
    { 
      id: 1, 
      commodity: 'Padi', 
      currentPrice: 6200, 
      trend: 'up', 
      region: 'Banyumas', 
      supply: 'Normal',
      lastUpdate: '26 Jul 2025'
    },
    { 
      id: 2, 
      commodity: 'Cabai Merah', 
      currentPrice: 35000, 
      trend: 'down', 
      region: 'Banyumas', 
      supply: 'Tinggi',
      lastUpdate: '26 Jul 2025'
    },
    { 
      id: 3, 
      commodity: 'Bawang Merah', 
      currentPrice: 28500, 
      trend: 'up', 
      region: 'Banyumas', 
      supply: 'Rendah',
      lastUpdate: '26 Jul 2025'
    },
    { 
      id: 4, 
      commodity: 'Jagung', 
      currentPrice: 4800, 
      trend: 'stable', 
      region: 'Banyumas', 
      supply: 'Normal',
      lastUpdate: '25 Jul 2025'
    }
  ];

  const monthlyDataChart = [
    { month: 'Jan', users: 1200, alerts: 45, dataPoints: 8500 },
    { month: 'Feb', users: 1350, alerts: 38, dataPoints: 9200 },
    { month: 'Mar', users: 1480, alerts: 52, dataPoints: 10100 },
    { month: 'Apr', users: 1650, alerts: 41, dataPoints: 11300 },
    { month: 'Mei', users: 1820, alerts: 35, dataPoints: 12800 },
    { month: 'Jun', users: 2100, alerts: 48, dataPoints: 14200 },
    { month: 'Jul', users: 2456, alerts: 42, dataPoints: 15678 }
  ];

  // Data risiko lereng untuk admin
  const slopeRiskSummary = {
    'Wonosobo Kota': { riskLevel: 'Sedang', score: 45, color: 'yellow' },
    'Kertek': { riskLevel: 'Tinggi', score: 75, color: 'red' },
    'Dieng Kulon': { riskLevel: 'Tinggi', score: 85, color: 'red' },
    'Garung': { riskLevel: 'Sedang', score: 35, color: 'yellow' },
    'Kalibawang': { riskLevel: 'Tinggi', score: 70, color: 'red' }
  };

  const slopeAnalysisResults = [
    {
      id: 1,
      type: 'drone',
      date: '2025-01-18',
      location: 'Kertek',
      status: 'processed',
      findings: ['Retakan tanah sepanjang 15m', 'Perubahan vegetasi'],
      riskChange: +15
    },
    {
      id: 2,
      type: 'satellite',
      date: '2025-01-15',
      location: 'Dieng Kulon',
      status: 'processed',
      findings: ['Deformasi permukaan', 'Perubahan tutupan lahan'],
      riskChange: +8
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredData = agriculturalData.filter(data =>
    data.commodity.toLowerCase().includes(searchData.toLowerCase()) ||
    data.region.toLowerCase().includes(searchData.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'farmer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Tinggi': return 'bg-red-500 text-white';
      case 'Sedang': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      
      // Simulasi proses analisis
      setTimeout(() => {
        setIsProcessing(false);
        toast.success(`Analisis ${uploadType === 'drone' ? 'drone' : 'citra satelit'} berhasil diproses`);
      }, 3000);
      
      toast.info('Memproses file... Harap tunggu beberapa saat');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard Administrator</h1>
        <p className="text-muted-foreground">Kelola sistem EcoScope Banyumas</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengguna</p>
                <h3 className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</h3>
                <p className="text-xs text-green-600">+12% dari bulan lalu</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Petani Aktif</p>
                <h3 className="text-2xl font-bold">{dashboardStats.activeFarmers.toLocaleString()}</h3>
                <p className="text-xs text-green-600">+8% dari bulan lalu</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <h3 className="text-2xl font-bold">{dashboardStats.dataPoints.toLocaleString()}</h3>
                <p className="text-xs text-blue-600">+15% dari bulan lalu</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alert Hari Ini</p>
                <h3 className="text-2xl font-bold">{dashboardStats.alertsToday}</h3>
                <p className="text-xs text-orange-600">-3 dari kemarin</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Alert Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <strong>{alert.type === 'slope' ? 'Risiko Longsor' : alert.type === 'weather' ? 'Cuaca Ekstrem' : 'Fluktuasi Harga'}</strong>
                    <span className="ml-2">di {alert.location}</span>
                  </div>
                  <span className="text-xs opacity-75">{alert.time}</span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tren Bulanan Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyDataChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Pengguna" />
              <Line type="monotone" dataKey="alerts" stroke="#f59e0b" name="Alert" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Kelola Pengguna</TabsTrigger>
          <TabsTrigger value="data">Data Pertanian</TabsTrigger>
          <TabsTrigger value="slope">Analisis Lereng</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manajemen Pengguna</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pengguna
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama atau email..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Role</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="farmer">Petani</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role === 'admin' ? 'Admin' : 'Petani'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.location}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Data Pertanian</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Data
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari komoditas atau daerah..."
                      value={searchData}
                      onChange={(e) => setSearchData(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Komoditas</TableHead>
                      <TableHead>Harga Saat Ini</TableHead>
                      <TableHead>Tren</TableHead>
                      <TableHead>Daerah</TableHead>
                      <TableHead>Supply</TableHead>
                      <TableHead>Update Terakhir</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell className="font-medium">{data.commodity}</TableCell>
                        <TableCell>Rp {data.currentPrice.toLocaleString()}</TableCell>
                        <TableCell className="flex items-center">
                          <span className="mr-2">{getTrendIcon(data.trend)}</span>
                          {data.trend === 'up' ? 'Naik' : data.trend === 'down' ? 'Turun' : 'Stabil'}
                        </TableCell>
                        <TableCell>{data.region}</TableCell>
                        <TableCell>
                          <Badge variant={data.supply === 'Normal' ? 'default' : data.supply === 'Tinggi' ? 'secondary' : 'destructive'}>
                            {data.supply}
                          </Badge>
                        </TableCell>
                        <TableCell>{data.lastUpdate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slope">
          <div className="space-y-6">
            {/* Slope Risk Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(slopeRiskSummary).map(([district, data]) => (
                <Card key={district} className={`border-2 ${
                  data.color === 'red' ? 'border-red-200 bg-red-50' :
                  data.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                  'border-green-200 bg-green-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${getRiskColor(data.riskLevel)} flex items-center justify-center`}>
                        <Mountain className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{district}</h4>
                        <Badge className={getRiskColor(data.riskLevel)} size="sm">
                          {data.riskLevel}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">Skor: {data.score}/100</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span>Upload Data Analisis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Jenis Analisis</Label>
                    <div className="flex space-x-4 mt-2">
                      <Button
                        variant={uploadType === 'drone' ? 'default' : 'outline'}
                        onClick={() => setUploadType('drone')}
                        className="flex items-center space-x-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Drone</span>
                      </Button>
                      <Button
                        variant={uploadType === 'satellite' ? 'default' : 'outline'}
                        onClick={() => setUploadType('satellite')}
                        className="flex items-center space-x-2"
                      >
                        <Satellite className="w-4 h-4" />
                        <span>Satelit</span>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="admin-file-upload" className="text-sm font-medium text-gray-700">
                      Upload File {uploadType === 'drone' ? 'Drone' : 'Citra Satelit'}
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="admin-file-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.tiff,.geotiff"
                        onChange={handleFileUpload}
                        disabled={isProcessing}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Format: JPG, PNG, TIFF, GeoTIFF. Maksimal 50MB
                    </p>
                  </div>

                  {isProcessing && (
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <RotateCcw className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-blue-800">Memproses analisis...</span>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Spesifikasi {uploadType === 'drone' ? 'Drone' : 'Satelit'}</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {uploadType === 'drone' ? (
                        <>
                          <li>• Resolusi minimal: 5cm/pixel</li>
                          <li>• Area coverage: 0.5-5 km²</li>
                          <li>• Format georeferensi diperlukan</li>
                        </>
                      ) : (
                        <>
                          <li>• Resolusi minimal: 10m/pixel</li>
                          <li>• Area coverage: 10-50 km²</li>
                          <li>• Sensor: Optical/SAR</li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Hasil Analisis Terbaru</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {slopeAnalysisResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              result.type === 'drone' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {result.type === 'drone' ? 
                                <Camera className="w-4 h-4 text-blue-600" /> :
                                <Satellite className="w-4 h-4 text-green-600" />
                              }
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">
                                {result.type === 'drone' ? 'Analisis Drone' : 'Citra Satelit'}
                              </h4>
                              <p className="text-xs text-gray-600">{result.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{new Date(result.date).toLocaleDateString('id-ID')}</span>
                            </div>
                            <Badge className={result.riskChange > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {result.riskChange > 0 ? '+' : ''}{result.riskChange}% Risk
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-1 text-sm">Temuan:</h5>
                          <ul className="space-y-1">
                            {result.findings.map((finding, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start space-x-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2"></span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900 text-sm">Rekomendasi Admin</h4>
                    </div>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Tingkatkan frekuensi monitoring di area berisiko tinggi</li>
                      <li>• Koordinasi dengan BPBD untuk area Kertek dan Dieng Kulon</li>
                      <li>• Evaluasi sistem peringatan dini setiap minggu</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pertumbuhan Pengguna</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyDataChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyDataChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="alerts" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}