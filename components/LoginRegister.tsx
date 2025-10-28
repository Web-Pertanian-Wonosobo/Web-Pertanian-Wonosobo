import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Auth API functions
const BACKEND_API = "http://127.0.0.1:8000/auth";

async function loginAdmin(credentials: { email: string; password: string }) {
  try {
    console.log("🔐 Attempting login for:", credentials.email);
    
    const response = await fetch(`${BACKEND_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log("📨 Backend response:", data);

    if (!response.ok) {
      console.error("❌ HTTP error:", response.status, data);
      throw new Error(data.detail || data.message || "Login gagal");
    }

    if (data.success === true && data.user) {
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("authRole", data.user.role);
      console.log("✅ Login berhasil! User saved to localStorage:", data.user);
    } else {
      console.warn("⚠️ Login gagal:", data.message);
    }

    return data;
  } catch (error: any) {
    console.error("❌ Login API error:", error);
    throw error;
  }
}

interface LoginRegisterProps {
  onLogin: (role: "guest" | "admin") => void;
}

export function LoginRegister({ onLogin }: LoginRegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input
    if (!loginData.email || !loginData.password) {
      toast.error("Email dan password harus diisi!");
      return;
    }

    setIsLoading(true);

    try {
      const email = loginData.email.trim().toLowerCase();
      const password = loginData.password;

      console.log("========================================");
      console.log("📤 LOGIN ATTEMPT");
      console.log("Email:", email);
      console.log("Password:", password);
      console.log("========================================");
      
      // Call backend API
      const response = await loginAdmin({ email, password });

      console.log("========================================");
      console.log("📥 BACKEND RESPONSE");
      console.log("Full response:", JSON.stringify(response, null, 2));
      console.log("response.success:", response.success);
      console.log("response.success === true:", response.success === true);
      console.log("response.user:", response.user);
      console.log("========================================");

      // CEK RESPONSE - hanya redirect jika success === true DAN user exists
      if (response.success === true && response.user) {
        console.log("✅✅✅ KONDISI SUCCESS TERPENUHI - AKAN REDIRECT");
        toast.success(`Selamat datang, ${response.user.name}! 🎉`);
        
        // Hanya admin yang bisa login
        if (response.user.role === "admin") {
          console.log("🔐 Redirecting to ADMIN dashboard");
          onLogin("admin");
        } else {
          // Bukan admin, tolak
          console.log("❌ User bukan admin, login ditolak");
          toast.error("Hanya admin yang bisa login!");
        }
      } else {
        // Login GAGAL - success === false
        console.log("❌❌❌ KONDISI SUCCESS TIDAK TERPENUHI - TIDAK REDIRECT");
        console.log("Reason: success =", response.success, ", user =", response.user);
        toast.error(response.message || "Email atau password salah! ❌");
        // JANGAN panggil onLogin() - STAY DI LOGIN PAGE
      }
    } catch (error: any) {
      // Error dari network atau server crash
      console.log("🔥🔥🔥 EXCEPTION CAUGHT");
      console.error("Error:", error);
      toast.error(error.message || "Gagal terhubung ke server! ⚠️");
    } finally {
      setIsLoading(false);
      console.log("========================================");
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

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-2xl font-semibold text-center">Masuk sebagai Admin</h2>
            <p className="text-sm text-gray-500 text-center">Masukkan kredensial admin Anda</p>
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" disabled={isLoading} />
                  Ingat saya
                </label>
                <a href="#" className="text-blue-600 hover:underline">
                  Lupa password?
                </a>
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

            {/* Tombol akses tanpa login */}
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

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 EcoScope Banyumas. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}
