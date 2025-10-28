import { useState } from 'react';
import { AdminNavigation } from '../components/AdminNavigation';
import { PageRouter } from '../components/PageRouter';
import { LoginRegister } from '../components/LoginRegister';
import { PublicNavigation } from '../components/PublicNavigation';

export default function App() {
  console.log('App component rendering...');
  const [appMode, setAppMode] = useState<'landing' | 'public' | 'admin'>('public');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState<'admin' | null>(null);

  const handleLogin = (role: 'admin' | 'guest') => {
    console.log('🔑 Login dengan role:', role);
    
    // HANYA set login jika role admin (bukan guest)
    if (role === 'admin') {
      setIsLoggedIn(true);
      setUserRole('admin');
      setCurrentPage('admin-dashboard');
      setAppMode('admin');
      console.log('✅ Admin logged in');
    } else if (role === 'guest') {
      // Guest = tidak login, tetap di public mode
      setIsLoggedIn(false);
      setUserRole(null);
      setCurrentPage('dashboard');
      setAppMode('public');
      console.log('👥 User continues as guest');
    }
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
    console.log('🚪 User logging out...');
    setIsLoggedIn(false);
    setUserRole(null); // RESET ROLE KE NULL
    setCurrentPage('dashboard');
    setAppMode('public');
    
    // Clear localStorage juga
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    console.log('✅ Logout complete, localStorage cleared');
  };

  // Tampilkan halaman login admin
  if (!isLoggedIn && currentPage === 'admin-login') {
    return (
      <div className="min-h-screen bg-background">
        <LoginRegister onLogin={handleLogin} />
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