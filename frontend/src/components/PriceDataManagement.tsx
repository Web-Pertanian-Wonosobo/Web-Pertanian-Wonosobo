import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  fetchPriceData, 
  addPriceData, 
  updatePriceData, 
  deletePriceData
} from '../services/priceDataApi';

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
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    commodity: '',
    location: '',
    currentPrice: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch data dari database lokal
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPriceData(undefined, undefined, undefined, undefined, 500);
      console.log("a‰¡Æ’A¶A¬ [PriceDataManagement] Data dari database:", data);
      
      // Convert ke format yang digunakan PriceDataManagement
      const converted = data.map((item) => ({
        id: item.price_id,
        commodity: item.commodity_name,
        location: item.market_location,
        currentPrice: item.price,
        previousPrice: item.price, // Tidak ada data previous
        unit: item.unit,
        date: item.date,
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
      date: new Date().toISOString().split('T')[0]
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
      const dataToSubmit = {
        user_id: 1, // Admin user ID
        commodity_name: formData.commodity,
        market_location: formData.location,
        unit: formData.unit,
        price: price,
        date: formData.date,
      };

      if (editingItem) {
        // Update existing item
        const result = await updatePriceData(editingItem.id, dataToSubmit);

        if (result.success) {
          toast.success('Data harga berhasil diperbarui');
          await loadData(); // Refresh data
        } else {
          toast.error(result.message);
        }
      } else {
        // Add new item
        const result = await addPriceData(dataToSubmit);

        if (result.success) {
          toast.success('Data harga berhasil ditambahkan');
          await loadData(); // Refresh data
        } else {
          toast.error(result.message);
        }
      }

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Gagal menyimpan data ke backend');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      commodity: item.commodity,
      location: item.location,
      currentPrice: item.currentPrice.toString(),
      unit: item.unit,
      date: item.date
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Data Harga Pertanian</h1>
          <p className="text-gray-600 mt-1">Kelola data harga komoditas pertanian di Kabupaten Wonosobo</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                    {commonCommodities.map(commodity => (
                      <SelectItem key={commodity} value={commodity}>
                        {commodity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  {editingItem ? 'Perbarui' : 'Tambah'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Komoditas</p>
                <p className="text-2xl font-bold text-gray-900">{priceData.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Harga Naik</p>
                <p className="text-2xl font-bold text-green-600">
                  {priceData.filter(item => item.trend === 'up').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Harga Turun</p>
                <p className="text-2xl font-bold text-red-600">
                  {priceData.filter(item => item.trend === 'down').length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Harga Komoditas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Komoditas</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Harga Saat Ini</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Tanggal Update</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : priceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Belum ada data komoditas
                    </TableCell>
                  </TableRow>
                ) : (
                  priceData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.commodity}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {item.currentPrice > 0 
                            ? `Rp ${item.currentPrice.toLocaleString('id-ID')}/${item.unit}`
                            : <span className="text-gray-400">Belum ada data</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTrendColor(item.trend)}>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(item.trend)}
                            <span className="capitalize">{item.trend}</span>
                          </div>
                        </Badge>
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

          {priceData.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Belum ada data harga yang tersedia</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
