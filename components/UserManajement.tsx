import { Users, UserPlus, Search, MoreVertical, Shield, User, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface UserManagementPageProps {
  onNavigate: (page: string) => void;
}

const mockUsers = [
  { id: 1, name: "Re", email: "budi@example.com", role: "admin", status: "active", village: "Kemranjen" },
  { id: 2, name: "Siti Aminah", email: "siti@example.com", role: "user", status: "active", village: "Somagede" },
  { id: 3, name: "Ahmad d", email: "ahmad@example.com", role: "user", status: "active", village: "Sumpiuh" },
  { id: 4, name: "Dewi Lestari", email: "dewi@example.com", role: "user", status: "inactive", village: "Banyumas" },
  { id: 5, name: "Eko DD", email: "eko@example.com", role: "user", status: "active", village: "Cilongok" },
];

export function UserManagementPage({ onNavigate }: UserManagementPageProps) {
  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">
          Kelola akses pengguna dan peran dalam sistem EcoScope
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengguna</p>
                <p className="text-2xl font-semibold mt-1">156</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admin</p>
                <p className="text-2xl font-semibold mt-1">8</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pengguna Aktif</p>
                <p className="text-2xl font-semibold mt-1">148</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pengguna Baru</p>
                <p className="text-2xl font-semibold mt-1">12</p>
                <p className="text-xs text-muted-foreground">Bulan ini</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Pengguna</CardTitle>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari pengguna..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Desa</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>{user.village}</TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge variant="default">
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <User className="mr-1 h-3 w-3" />
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.status === "active" ? (
                      <Badge variant="default" className="bg-green-500">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Tidak Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}