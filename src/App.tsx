import { useState } from "react";
import { Navigation } from "../components/Navigation";
import { AdminNavigation } from "../components/AdminNavigation";
import { LoginRegister } from "../components/LoginRegister";
import { PageRouter } from "../components/PageRouter";

export default function App() {
  // Role awal: guest (belum login)
  const [userRole, setUserRole] = useState<"guest" | "farmer" | "admin">("guest");
  const [currentPage, setCurrentPage] = useState("dashboard"); // halaman default

  const handlePageChange = (page: string) => setCurrentPage(page);

  const handleRoleChange = (role: "guest" | "farmer" | "admin") => {
  setUserRole(role);
  setCurrentPage(
    role === "admin" ? "admin-dashboard" : "dashboard"
  );
};


  const handleLogout = () => {
    setUserRole("guest");
    setCurrentPage("dashboard");
  };

  // Pilih sidebar sesuai role
  const NavigationComponent =
    userRole === "admin" ? AdminNavigation : Navigation;

  // Kalau sedang di halaman login/register
  if (currentPage === "loginregister") {
    return (
      <LoginRegister
        onLogin={(role) => handleRoleChange(role)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <NavigationComponent
        currentPage={currentPage}
        onPageChange={handlePageChange}
        userRole={userRole}
        onLogout={handleLogout}
        onLoginPage={() => setCurrentPage("loginregister")}
      />

      <main className="flex-1 md:ml-0">
        <PageRouter
          currentPage={currentPage}
          userRole={userRole}
          onNavigate={handlePageChange}
          onRoleChange={handleRoleChange}
          onLogout={handleLogout}
        />
      </main>
    </div>
  );
}