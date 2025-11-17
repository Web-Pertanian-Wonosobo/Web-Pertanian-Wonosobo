import React from 'react';
import { Dashboard } from './Dashboard';
import { WeatherPrediction } from './WeatherPrediction';
import { PricePrediction } from './PricePredictionNew';
import { SlopeAnalysis } from './SlopeAnalysis';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { LoginRegisterWithRole } from './LoginRegisterWithRole';
import { PriceDataManagement } from './PriceDataManagement';

interface PageRouterProps {
  currentPage: string;
  userRole: 'admin' | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export function PageRouter({ currentPage, userRole, onNavigate, onLogout, isLoggedIn }: PageRouterProps) {
  // Halaman yang bisa diakses tanpa login (publik)
  const publicPages = ['dashboard', 'weather', 'price-prediction', 'slope-analysis'];
  
  // Halaman khusus admin
  const adminPages = ['admin-dashboard', 'user-management', 'price-data-management'];

  switch (currentPage) {
    case 'dashboard':
      return <Dashboard onNavigate={onNavigate} />;
    
    case 'weather':
      return <WeatherPrediction />;
    
    case 'price-prediction':
      return <PricePrediction />;
    
    case 'slope-analysis':
      return <SlopeAnalysis />;
    
    case 'admin-login':
      return <LoginRegisterWithRole onLogin={(role) => {
        onNavigate('admin-dashboard');
        // Callback akan ditangani di App.tsx
      }} />;
    
    // Halaman khusus admin (perlu login)
    case 'admin-dashboard':
      if (!isLoggedIn || userRole !== 'admin') {
        return <LoginRegisterWithRole onLogin={() => {}} />;
      }
      return <AdminDashboard onNavigate={onNavigate} />;
    
    case 'price-data-management':
      if (!isLoggedIn || userRole !== 'admin') {
        return <LoginRegisterWithRole onLogin={() => {}} />;
      }
      return <PriceDataManagement />;
    
    case 'user-management':
      if (!isLoggedIn || userRole !== 'admin') {
        return <LoginRegisterWithRole onLogin={() => {}} />;
      }
      return <UserManagement />;
    
    default:
      return <Dashboard onNavigate={onNavigate} />;
  }
}