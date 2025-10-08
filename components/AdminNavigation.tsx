import React from "react";
import {
  Home,
  Users,
  Database,
  BarChart3,
  Settings,
  Menu,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Badge } from "./ui/badge";

interface AdminNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const adminMenu = [
  { id: "admin-dashboard", label: "Dashboard", icon: Home },
  { id: "user-management", label: "Manajemen Pengguna", icon: Users },
  { id: "data-management", label: "Data Pertanian", icon: Database },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "admin-settings", label: "Pengaturan", icon: Settings },
];

export function AdminNavigation({
  currentPage,
  onPageChange,
  onLogout,
}: AdminNavigationProps) {
  const NavigationLinks = () => (
    <nav className="flex flex-col space-y-1">
      {adminMenu.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={`justify-start w-full text-base ${
              isActive ? "font-semibold" : "text-muted-foreground"
            }`}
            onClick={() => onPageChange(item.id)}
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 🖥️ Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-50 border-r p-6 flex-col shadow-sm">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">EcoScope</h1>
          </div>
          <p className="text-sm text-gray-500">Panel Administrator</p>
          <Badge variant="destructive" className="mt-2">
            Admin Mode
          </Badge>
        </div>

        <NavigationLinks />

        {/* 🚪 Tombol Logout */}
        <div className="mt-auto pt-4 border-t">
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* 📱 Mobile Navbar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-primary">EcoScope</h1>
          </div>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetTitle>Admin Navigation</SheetTitle>
            <SheetDescription>
              Navigasi EcoScope Banyumas Admin
            </SheetDescription>
            <div className="mb-6 mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-primary">EcoScope</h1>
              </div>
              <Badge variant="destructive">Admin Mode</Badge>
            </div>
            <NavigationLinks />
            <div className="mt-6">
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}