import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  DollarSign,
  Download, 
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchPriceData, addPriceData, updatePriceData, deletePriceData } from '../services/priceDataApi';
import { fetchCommodities } from '../services/commodityApi';
import { CommodityManagement } from './CommodityManagement';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

const logActivity = async (activity: string) => {
  try {
    await fetch(`${API_BASE_URL}/market/log?activity=${encodeURIComponent(activity)}`, {
      method: 'POST'
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// Data akan diambil dari API, bukan hardcoded
const initialPriceData: any[] = [];

const wonosoboLocations = [
  'Wonosobo Kota', 'Kertek', 'Garung', 'Leksono', 'Sukoharjo', 
  'Selomerto', 'Kejajar', 'Mojotengah', 'Sapuran', 'Kalibawang',
  'Kaliwiro', 'Watumalang'
];

const commonCommodities = [
  'Kentang', 'Wortel', 'Kubis', 'Kopi', 'Strawberry', 'Bawang Daun',
  'Jagung', 'Tembakau', 'Carica', 'Padi', 'Tomat', 'Lettuce'
];

export function PriceDataManagement() {
  const [priceData, setPriceData] = useState(initialPriceData);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [dynamicCommodities, setDynamicCommodities] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    commodity: '',
    location: '',
    currentPrice: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0],
    plantingDate: ''
  });

  // Fetch data dari database lokal
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load price entries
      const data = await fetchPriceData(undefined, undefined, undefined, undefined, 500);
      
      // Load unique commodities for dropdown
      const commodities = await fetchCommodities();
      if (commodities.length > 0) {
        setDynamicCommodities(commodities.map(c => c.name));
      } else {
        // Fallback to hardcoded list if database is empty
        setDynamicCommodities(commonCommodities);
      }
      
      // Convert ke format yang digunakan PriceDataManagement
      const converted = data.map((item) => ({
        id: item.price_id,
        commodity: item.commodity_name,
        location: item.market_location,
        currentPrice: item.price,
        previousPrice: item.price, // Tidak ada data previous
        unit: item.unit,
        date: item.date,
        plantingDate: item.planting_date || '',
        trend: 'stable' as const
      }));
      
      setPriceData(converted);
      console.log("I“A£A  [PriceDataManagement] Data loaded:", converted.length, "records");
    } catch (error) {
      console.error("Error fetching price data:", error);
      toast.error("Gagal memuat data harga");
      setPriceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      commodity: '',
      location: '',
      currentPrice: '',
      unit: 'kg',
      date: new Date().toISOString().split('T')[0],
      plantingDate: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    if (!formData.commodity || !formData.location || !formData.currentPrice) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    const price = parseFloat(formData.currentPrice);
    if (isNaN(price) || price < 0) {
      toast.error('Harga harus berupa angka positif');
      return;
    }

    try {
      // Validasi data sebelum submit
      const commodity = formData.commodity.trim();
      const location = formData.location.trim();
      const unit = formData.unit.trim();
      
      if (!commodity || !location || !unit) {
        toast.error('Semua field wajib diisi dan tidak boleh kosong');
        return;
      }
      
      const dataToSubmit = {
        user_id: JSON.parse(localStorage.getItem('authUser') || '{}').user_id || 1,
        commodity_name: commodity,
        market_location: location,
        unit: unit,
        price: price,
        date: formData.date || new Date().toISOString().split('T')[0], // Default ke hari ini
        planting_date: formData.plantingDate || null
      };
      
      console.log('📊 Data yang akan dikirim:', dataToSubmit);

      if (editingItem) {
        // Update existing item
        const result = await updatePriceData(editingItem.id, dataToSubmit);

        if (result.success) {
          toast.success('Data harga berhasil diperbarui');
          await loadData(); // Refresh data
        } else {
          toast.error(`Gagal update: ${result.message}`);
        }
      } else {
        // Add new item
        const result = await addPriceData(dataToSubmit);

        if (result.success) {
          toast.success('Data harga berhasil ditambahkan');
          await loadData(); // Refresh data
        } else {
          toast.error(`Gagal tambah data: ${result.message}`);
        }
      }

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error(`Gagal menyimpan data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      commodity: item.commodity,
      location: item.location,
      currentPrice: item.currentPrice.toString(),
      unit: item.unit,
      date: item.date,
      plantingDate: item.plantingDate || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return;
    }

    try {
      const result = await deletePriceData(id);
      
      if (result.success) {
        toast.success('Data harga berhasil dihapus');
        await loadData(); // Refresh data
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Gagal menghapus data dari backend');
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'bg-green-100 text-green-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportCSV = () => {
    logActivity("Download CSV Dataset");
    if (priceData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    // Header CSV
    const headers = ['ID', 'Komoditas', 'Lokasi', 'Harga', 'Satuan', 'Tanggal', 'Waktu Tanam'];
    
    // Data rows
    const rows = priceData.map(item => [
      item.id,
      item.commodity,
      item.location,
      item.currentPrice,
      item.unit,
      item.date,
      item.plantingDate || '-'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dataset_harga_wonosobo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Dataset berhasil diunduh');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Data & Komoditas</h1>
          <p className="text-gray-600">Input harga pasar dan kelola daftar komoditas sistem</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Unduh Dataset (CSV)
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prices" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="prices" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Input Harga
          </TabsTrigger>
          <TabsTrigger value="commodities" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Plus className="w-4 h-4 mr-2" />
            Daftar Komoditas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Riwayat Harga Pasar</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Data Harga
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Data Harga' : 'Tambah Data Harga'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="commodity">Komoditas *</Label>
                      <Select
                        value={formData.commodity}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, commodity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih komoditas" />
                        </SelectTrigger>
                        <SelectContent>
                          {dynamicCommodities.map(commodity => (
                            <SelectItem key={commodity} value={commodity}>
                              {commodity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Jika komoditas tidak ada, tambahkan di tab "Daftar Komoditas"
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="location">Lokasi *</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih lokasi" />
                        </SelectTrigger>
                        <SelectContent>
                          {wonosoboLocations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="currentPrice">Harga *</Label>
                        <Input
                          id="currentPrice"
                          type="number"
                          placeholder="0"
                          value={formData.currentPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Satuan</Label>
                        <Select
                          value={formData.unit}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="butir">butir</SelectItem>
                            <SelectItem value="ikat">ikat</SelectItem>
                            <SelectItem value="pack">pack</SelectItem>
                            <SelectItem value="liter">liter</SelectItem>
                            <SelectItem value="ekor">ekor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="date">Tanggal</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="plantingDate">Waktu Tanam (Opsional)</Label>
                      <Input
                        id="plantingDate"
                        type="date"
                        value={formData.plantingDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimasi tanggal mulai penanaman
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                      {editingItem ? 'Update' : 'Tambah'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="font-bold text-gray-900">Komoditas</TableHead>
                      <TableHead className="font-bold text-gray-900">Lokasi</TableHead>
                      <TableHead className="font-bold text-gray-900">Harga</TableHead>
                      <TableHead className="font-bold text-gray-900">Waktu Tanam</TableHead>
                      <TableHead className="font-bold text-gray-900">Tanggal</TableHead>
                      <TableHead className="font-bold text-gray-900 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Memuat data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      priceData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.commodity}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>Rp {item.currentPrice.toLocaleString()}</span>
                              <Badge variant="outline" className={getTrendColor(item.trend)}>
                                {getTrendIcon(item.trend)}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-gray-400">per {item.unit}</span>
                          </TableCell>
                          <TableCell>
                            {item.plantingDate ? (
                              <div className="flex items-center space-x-1">
                                <Plus className="w-3 h-3 text-green-500" />
                                <span className="text-sm">{new Date(item.plantingDate).toLocaleDateString('id-ID')}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Tidak ada data</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {priceData.length === 0 && !loading && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Belum ada data harga yang tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commodities">
          <CommodityManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
