import { useState } from "react";
import { Navigation } from "../components/Navigation";
import { AdminNavigation } from "../components/AdminNavigation";
import { PageRouter } from "../components/PageRouter";

export default function App() {
  const [currentPage, setCurrentPage] = useState("loginregister"); // arahkan ke loginregister saat pertama kali
  const [userRole, setUserRole] = useState<"farmer" | "admin">("farmer");

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const handleRoleChange = (role: "farmer" | "admin") => {
    setUserRole(role);
    setCurrentPage("dashboard"); // opsional: arahkan ke dashboard setelah ganti role
  };

  const handleLogout = () => {
    setUserRole("farmer");
    setCurrentPage("loginregister"); // arahkan ke loginregister saat logout
  };

  // Tampilkan aplikasi utama jika sudah login
  const NavigationComponent =
    userRole === "admin" ? AdminNavigation : Navigation;

  return (
    <div className="min-h-screen bg-background flex">
      <NavigationComponent
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      <main className="flex-1 md:ml-0">
        <PageRouter
          currentPage={currentPage}
          userRole={userRole}
          onNavigate={handlePageChange}
          onRoleChange={handleRoleChange}   // <-- Tambahkan ini
          onLogout={handleLogout}
        />
      </main>
    </div>
  );
}