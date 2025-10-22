import React, { useState } from 'react';
import { AdminNavigation } from '../components/AdminNavigation';
import { PageRouter } from '../components/PageRouter';
import { LoginRegisterWithRole } from '../components/LoginRegisterWithRole';
import { LandingPage } from '../components/LandingPage';
import { PublicNavigation } from '../components/PublicNavigation';

export default function App() {
  const [appMode, setAppMode] = useState<'landing' | 'public' | 'admin'>('public');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState<'admin'>('admin');

  const handleLoginClick = () => {
    setCurrentPage('admin-login');
    setAppMode('public');
  };

  const handleGoToPublicApp = () => {
    setAppMode('public');
    setCurrentPage('dashboard');
  };

  const handleLogin = (role: 'admin' | 'farmer') => {
    setIsLoggedIn(true);
    setUserRole('admin');
    setCurrentPage('admin-dashboard');
    setAppMode('admin');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    
    // Jika berpindah ke admin-login dari public mode
    if (page === 'admin-login') {
      setAppMode('landing');
    }
    
    // Jika sudah login dan berpindah ke halaman admin
    if (isLoggedIn && page.startsWith('admin-')) {
      setAppMode('admin');
    }
    
    // Jika berpindah ke halaman public
    if (['dashboard', 'weather', 'price-prediction', 'slope-analysis'].includes(page)) {
      setAppMode('public');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('admin');
    setCurrentPage('dashboard');
    setAppMode('public'); // Tetap di public app, tidak kembali ke landing
  };

  // Tampilkan landing page jika mode landing
  // if (appMode === 'landing') {
  //   return (
  //     <LandingPage 
  //       onLoginClick={handleLoginClick} 
  //       onGoToApp={handleGoToPublicApp}
  //     />
  //   );
  // }

  // Tampilkan halaman login admin
  if (!isLoggedIn && currentPage === 'admin-login') {
    return (
      <div className="min-h-screen bg-background">
        <LoginRegisterWithRole onLogin={handleLogin} />
      </div>
    );
  }

  // Tentukan komponen navigasi
  const NavigationComponent = (isLoggedIn && appMode === 'admin') ? AdminNavigation : PublicNavigation;

  return (
    <div className="min-h-screen bg-background flex">
      <NavigationComponent 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        isLoggedIn={isLoggedIn}
      />
      
      <main className="flex-1 md:ml-64">
        <PageRouter
          currentPage={currentPage}
          userRole={isLoggedIn ? userRole : null}
          onNavigate={handlePageChange}
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
        />
      </main>
    </div>
  );
}