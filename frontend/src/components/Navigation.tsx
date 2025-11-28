import React from "react";
import { Home, Mountain, CloudSun, TrendingUp, LogIn, LogOut, User, Menu, Cloud } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userRole: "guest" | "farmer" | "admin";
  onLogout: () => void;
  onLoginPage: () => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "slope", label: "Analisis Lereng", icon: Mountain },
  { id: "weather", label: "Prediksi Cuaca", icon: CloudSun },
  { id: "openweather", label: "Data OpenWeather", icon: Cloud },
  { id: "price", label: "Prediksi Harga", icon: TrendingUp },
]; 

export function Navigation({
  currentPage,
  onPageChange,
  userRole,
  onLogout,
  onLoginPage,
}: NavigationProps) {
  const NavigationContent = () => (
    <nav className="flex flex-col space-y-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={currentPage === item.id ? "default" : "ghost"}
            className="justify-start w-full text-lg"
            onClick={() => onPageChange(item.id)}
          >
            <Icon className="w-5 h-5 mr-3" />
            {item.label}
          </Button>
        );
      })}

      <div className="pt-4 border-t border-gray-200 mt-4">
        {userRole === "guest" ? (
          <Button
            onClick={onLoginPage}
            variant="outline"
            className="w-full justify-start text-lg"
          >
            <LogIn className="w-5 h-5 mr-3" /> Masuk / Daftar
          </Button>
        ) : (
          <>
            <div className="flex items-center mb-3 text-gray-600 px-2">
              <User className="w-4 h-4 mr-2" />
              <span className="capitalize">Masuk sebagai {userRole}</span>
            </div>
            <Button
              onClick={onLogout}
              variant="destructive"
              className="w-full justify-start text-lg"
            >
              <LogOut className="w-5 h-5 mr-3" /> Keluar
            </Button>
          </>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 bg-card border-r p-6 flex-col">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <img src="src/assets/logo.svg" alt="SiagaTani Logo" className="w-20 h-20" />
            <h1 className="text-2xl font-bold text-primary">SiagaTani</h1>
          </div>
          <p className="text-muted-foreground">
            Monitoring Lingkungan Wonosobo
          </p>
        </div>
        <NavigationContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl"></span>
            <h1 className="text-xl font-bold text-primary">SiagaTani</h1>
          </div>
          <p className="text-sm text-muted-foreground">Wonosobo</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetTitle>SiagaTani Navigation</SheetTitle>
            <SheetDescription>
              Navigasi utama aplikasi SiagaTani Wonosobo
            </SheetDescription>
            <div className="mb-8 mt-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl"></span>
                <h1 className="text-2xl font-bold text-primary">SiagaTani</h1>
              </div>
              <p className="text-muted-foreground">
                Monitoring Lingkungan Wonosobo
              </p>
            </div>
            <NavigationContent />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}