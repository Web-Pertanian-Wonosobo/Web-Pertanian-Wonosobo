import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchCommodities, addCommodity, deleteCommodity, type Commodity } from '../services/commodityApi';

export function CommodityManagement() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommodity, setNewCommodity] = useState({ name: '', category: 'Umum' });

  const loadCommodities = async () => {
    try {
      setLoading(true);
      const data = await fetchCommodities();
      setCommodities(data);
    } catch (error) {
      toast.error("Gagal memuat data komoditas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommodities();
  }, []);

  const handleAddCommodity = async () => {
    if (!newCommodity.name.trim()) {
      toast.error("Nama komoditas tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addCommodity(newCommodity);
      if (result.success) {
        toast.success(result.message);
        setIsDialogOpen(false);
        setNewCommodity({ name: '', category: 'Umum' });
        loadCommodities();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menambah komoditas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komoditas ini?")) return;

    try {
      const result = await deleteCommodity(id);
      if (result.success) {
        toast.success(result.message);
        loadCommodities();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal menghapus komoditas");
    }
  };

  const filteredCommodities = commodities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Daftar Komoditas Sistem</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Komoditas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Komoditas Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Komoditas</Label>
                  <Input 
                    id="name" 
                    placeholder="Contoh: Tomat, Wortel, Bawang" 
                    value={newCommodity.name}
                    onChange={(e) => setNewCommodity({...newCommodity, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Input 
                    id="category" 
                    placeholder="Contoh: Sayuran, Buah, Palawija" 
                    value={newCommodity.category}
                    onChange={(e) => setNewCommodity({...newCommodity, category: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button onClick={handleAddCommodity} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari komoditas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-gray-900">Nama Komoditas</TableHead>
                <TableHead className="font-bold text-gray-900">Kategori</TableHead>
                <TableHead className="font-bold text-gray-900">Tanggal Dibuat</TableHead>
                <TableHead className="font-bold text-gray-900 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredCommodities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Belum ada data komoditas
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommodities.map((c) => (
                  <TableRow key={c.commodity_id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(c.commodity_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
