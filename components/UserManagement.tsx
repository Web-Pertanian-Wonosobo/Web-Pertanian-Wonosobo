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
import { Plus, Pencil, Trash2, Search, UserPlus, Shield, User } from 'lucide-react';
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

    // Check if email already exists
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

    // Check if email already exists (excluding current user)
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
            description: formData.description
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
                <Label htmlFor="add-role">Role</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'moderator') => setFormData({ ...formData, role: value })}>
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
                <Label htmlFor="add-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
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
                <Label htmlFor="add-description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="add-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi tugas atau tanggung jawab"
                  rows={3}
                />
              </div>
               <div>
                <Label htmlFor="add-address">Alamat</Label>
                <Textarea
                  id="add-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat"
                  rows={3}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daftar User ({filteredUsers.length})</span>
          </CardTitle>
          
          {/* Filter dan Search */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Login Terakhir</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Tidak ada user yang ditemukan</p>
                        {searchTerm && (
                          <p className="text-sm">Coba ubah kata kunci pencarian</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.description && (
                            <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                              {user.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                          {getRoleIcon(user.role)}
                          {user.role === 'admin' ? 'Admin' : 'Moderator'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLogin ? (
                            <span>{user.lastLogin}</span>
                          ) : (
                            <span className="text-gray-400">Belum pernah login</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{user.createdAt}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={user.email === 'admin@ecoscope-wonosobo.id'}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus user "{user.name}"? 
                                  Tindakan ini tidak dapat dibatalkan.
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
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
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                disabled={selectedUser?.email === 'admin@ecoscope-wonosobo.id'}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: 'admin' | 'moderator') => setFormData({ ...formData, role: value })}
                disabled={selectedUser?.email === 'admin@ecoscope-wonosobo.id'}
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
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                disabled={selectedUser?.email === 'admin@ecoscope-wonosobo.id'}
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
              <Label htmlFor="edit-description">Deskripsi (Opsional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi tugas atau tanggung jawab"
                rows={3}
              />
            </div>
             <div>
                <Label htmlFor="edit-address">Alamat</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat"
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