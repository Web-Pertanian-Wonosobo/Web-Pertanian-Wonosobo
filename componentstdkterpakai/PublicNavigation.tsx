import React from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from './ui/sheet';
import { 
  MapPin, 
  CloudRain, 
  TrendingUp, 
  Mountain,
  Menu,
  Home,
  User
} from 'lucide-react';

interface PublicNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isLoggedIn?: boolean;
}

export function PublicNavigation({ currentPage, onPageChange, isLoggedIn }: PublicNavigationProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'weather', label: 'Prediksi Cuaca', icon: CloudRain },
    { id: 'price-prediction', label: 'Prediksi Harga', icon: TrendingUp },
    { id: 'slope-analysis', label: 'Analisis Lereng', icon: Mountain },
  ];

  const NavContent = () => (
    <>
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3"> 
          {/* <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div> */}
          <div className="inline-flex items-center justify-center w-20 h-24 rounded-full">
        <img 
        src="src/assets/logo.svg" 
        alt="EcoScope" 
        style={{ width: '75px', height: '75px', objectFit: 'contain' }} 
          />
      </div> 
          <div>
            <h2 className="font-semibold text-gray-900">EcoScope Wonosobo</h2>
            <p className="text-sm text-gray-600">Sistem Monitoring Pertanian</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onPageChange('admin-login')}
        >
          <User className="w-4 h-4 mr-2" />
          Login Admin
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-gray-900">EcoScope Wonosobo</h1>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <SheetDescription className="sr-only">
                Menu navigasi untuk mengakses fitur-fitur EcoScope Wonosobo
              </SheetDescription>
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>
      </div>

      {/* Desktop Navigation */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
        <NavContent />
      </aside>
    </>
  );
}