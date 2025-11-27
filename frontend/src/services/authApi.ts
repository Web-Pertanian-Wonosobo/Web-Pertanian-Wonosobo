const BACKEND_API = "http://127.0.0.1:8000/auth";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    user_id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    last_login: string | null;
  };
  role: string;
}

export async function loginAdmin(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    
    const response = await fetch(`${BACKEND_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log("📨 Backend response:", data);

    // Jika response status tidak OK (500, dll), throw error
    if (!response.ok) {
      console.error("❌ HTTP error:", response.status, data);
      throw new Error(data.detail || data.message || "Login gagal");
    }

    // CEK SUCCESS - hanya simpan jika success === true
    if (data.success === true && data.user) {
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("authRole", data.user.role);
      console.log("✅ Login berhasil! User saved to localStorage:", data.user);
    } else {
      // Login gagal tapi HTTP 200 (email/password salah)
      console.warn("⚠️ Login gagal:", data.message);
      // JANGAN simpan ke localStorage
      // JANGAN throw error, biarkan LoginRegister.tsx yang handle
    }
    
    return data;
  } catch (error: any) {
    console.error("❌ Login API error:", error);
    throw error;
  }
}

export function logout() {
  localStorage.removeItem("authUser");
  localStorage.removeItem("authRole");
  console.log("🚪 User logged out, localStorage cleared");
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("authUser") !== null;
}

export function getCurrentUser() {
  const userData = localStorage.getItem("authUser");
  return userData ? JSON.parse(userData) : null;
}
