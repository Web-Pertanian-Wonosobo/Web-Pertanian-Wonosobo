import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Pencil, Trash2, Search, UserPlus, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator';
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  description?: string;
  address?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin Utama',
      email: 'admin@ecoscope-wonosobo.id',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30:00',
      address: 'Jl. Utama, Wonosobo, Jawa Tengah',
      createdAt: '2024-01-01 08:00:00',
      description: 'Administrator utama sistem EcoScope Wonosobo'
    },
    {
      id: '2',
      name: 'Moderator Pertanian',
      email: 'moderator@ecoscope-wonosobo.id',
      role: 'moderator',
      status: 'active',
      lastLogin: '2024-01-14 16:45:00',
      createdAt: '2024-01-05 09:15:00',
      address: 'Jl. Pertanian, Wonosobo, Jawa Tengah',
      description: 'Moderator untuk manajemen data pertanian dan harga komoditas'
    },
    {
      id: '3',
      name: 'Operator Data',
      email: 'operator@ecoscope-wonosobo.id',
      role: 'moderator',
      status: 'inactive',
      lastLogin: '2024-01-10 14:20:00',
      createdAt: '2024-01-08 11:30:00',
      address: 'Jl. Pertanian, Wonosobo, Jawa Tengah',
      description: 'Operator input data cuaca dan analisis lereng'
    }
    
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'moderator' as 'admin' | 'moderator',
    status: 'active' as 'active' | 'inactive',
    description: '',
    address: ''
  });

  // Filter users berdasarkan search dan filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'moderator',
      status: 'active',
      description: '',
      address: ''
    });
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      toast.error('Nama dan email harus diisi');
      return;
    }

    if (users.some(user => user.email === formData.email)) {
      toast.error('Email sudah digunakan');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      description: formData.description,
      address: formData.address
    };

    setUsers([...users, newUser]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success('User berhasil ditambahkan');
  };

  const handleEditUser = () => {
    if (!selectedUser || !formData.name || !formData.email) {
      toast.error('Nama dan email harus diisi');
      return;
    }

    if (users.some(user => user.email === formData.email && user.id !== selectedUser.id)) {
      toast.error('Email sudah digunakan');
      return;
    }

    const updatedUsers = users.map(user =>
      user.id === selectedUser.id
        ? {
            ...user,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            description: formData.description,
            address: formData.address
          }
        : user
    );

    setUsers(updatedUsers);
    resetForm();
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    toast.success('User berhasil diperbarui');
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.email === 'admin@ecoscope-wonosobo.id') {
      toast.error('Admin utama tidak dapat dihapus');
      return;
    }

    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    toast.success('User berhasil dihapus');
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      description: user.description || '',
      address: user.address || ''
    });
    setIsEditDialogOpen(true);
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Kelola User</h1>
          <p className="text-gray-600 mt-2">
            Kelola akun pengguna dan hak akses sistem EcoScope Wonosobo
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>
                Lengkapi form di bawah untuk menambahkan user baru ke sistem.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="add-name">Nama Lengkap</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v: 'admin' | 'moderator') => setFormData({ ...formData, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v: 'active' | 'inactive') => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Deskripsi (Opsional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi tugas atau tanggung jawab"
                />
              </div>

              <div>
                <Label>Alamat</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  placeholder="Alamat"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddUser}>
                Tambah User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTER SECTION */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full sm:w-40">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card> */}

           {/* TABEL USER */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar User ({filteredUsers.length})</CardTitle>
        </CardHeader>
      <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 bg-white z-20 shadow-md">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold border-b w-2/6">User</th>
                      <th className="text-center px-4 py-3 font-semibold border-b w-1/12">Role</th>
                      <th className="text-center px-4 py-3 font-semibold border-b w-1/12">Status</th>
                      <th className="text-center px-4 py-3 font-semibold border-b w-1/6">Login Terakhir</th>
                      <th className="text-center px-4 py-3 font-semibold border-b w-1/6">Dibuat</th>
                      <th className="text-left px-4 py-3 font-semibold border-b w-2/12">Alamat</th>
                      <th className="text-center px-4 py-3 font-semibold border-b w-1/12">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-gray-500">Tidak ada user yang ditemukan</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="align-top">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.description && (
                                <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                  {user.description}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 justify-center w-fit mx-auto">
                              {getRoleIcon(user.role)}
                              {user.role === 'admin' ? 'Admin' : 'Moderator'}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <Badge variant={getStatusBadgeVariant(user.status)}>
                              {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 text-center">
                            {user.lastLogin || <span className="text-gray-400">Belum pernah login</span>}
                          </td>

                          <td className="px-4 py-3 text-center">{user.createdAt}</td>

                          <td className="px-4 py-3">
                            <div className="text-sm">
                              {user.address || '-'}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                                <Pencil className="w-4 h-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={user.email === 'admin@ecoscope-wonosobo.id'}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus user "{user.name}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>

      </Card>

      {/* EDIT USER */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Perbarui informasi user yang dipilih.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nama Lengkap</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                disabled={selectedUser?.email === 'admin@ecoscope-wonosobo.id'}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Role</Label>
              <Select
                value={formData.role}
                disabled={selectedUser?.email === 'admin@ecoscope-wonosobo.id'}
                onValueChange={(v: 'admin' | 'moderator') => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                disabled={selectedUser?.email === 'admin@ecoscope-wonosobo.id'}
                onValueChange={(v: 'active' | 'inactive') => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Alamat</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditUser}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}