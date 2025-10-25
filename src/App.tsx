import { useState } from 'react';
import { AdminNavigation } from '../components/AdminNavigation';
import { PageRouter } from '../components/PageRouter';
import { LoginRegisterWithRole } from '../components/LoginRegisterWithRole';
import { PublicNavigation } from '../components/PublicNavigation';

export default function App() {
  console.log('App component rendering...');
  const [appMode, setAppMode] = useState<'landing' | 'public' | 'admin'>('public');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState<'admin'>('admin');

  const handleLogin = (role: 'admin' | 'farmer') => {
    console.log('Login dengan role:', role);
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
    if (['dashboard', 'weather', 'bmkg-weather', 'price-prediction', 'slope-analysis'].includes(page)) {
      setAppMode('public');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('admin');
    setCurrentPage('dashboard');
    setAppMode('public');
  };

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