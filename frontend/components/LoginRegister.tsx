import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ✅ Dummy Admin (pengganti API BE)
const DUMMY_ADMIN = {
  email: "admin@example.com",
  password: "admin123",
  name: "Administrator",
  role: "admin",
};

interface LoginRegisterProps {
  onLogin: (role: "guest" | "admin") => void;
}

export function LoginRegister({ onLogin }: LoginRegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Email dan password harus diisi!");
      return;
    }

    setIsLoading(true);

    try {
      const email = loginData.email.trim().toLowerCase();
      const password = loginData.password;

      console.log("🔐 LOGIN WITH DUMMY DATA");
      console.log("Email:", email);
      console.log("Password:", password);

      // ============================
      // 🔥 LOGIN TANPA BACKEND
      // ============================
      if (
        email === DUMMY_ADMIN.email &&
        password === DUMMY_ADMIN.password
      ) {
        toast.success(`Selamat datang, ${DUMMY_ADMIN.name}! 🎉`);

        // Simpan ke localStorage (opsional)
        localStorage.setItem("authUser", JSON.stringify(DUMMY_ADMIN));
        localStorage.setItem("authRole", "admin");

        // Masuk dashboard
        onLogin("admin");
      } else {
        toast.error("Email atau password salah!");
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            EcoScope Banyumas
          </h1>
          <p className="text-gray-600">
            Platform monitoring lingkungan dan pasar pertanian
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-2xl font-semibold text-center">Masuk sebagai Admin</h2>
            <p className="text-sm text-gray-500 text-center">
              Masukkan kredensial admin Anda
            </p>
          </CardHeader>

          <CardContent>
            {/* FORM LOGIN */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Atau</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => onLogin("guest")}
                disabled={isLoading}
              >
                Lanjutkan sebagai Tamu
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 EcoScope Banyumas. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}
