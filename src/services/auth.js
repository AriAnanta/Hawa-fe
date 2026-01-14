// src/services/auth.js
// Authentication service: konsumsi API backend FastAPI via VITE_API_BASE_URL

const AUTH_KEY = 'hawa_auth_token';
const USER_KEY = 'hawa_user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const data = await response.json();
      
      // Handle FastAPI validation errors (422) - detail bisa berupa array atau object
      if (response.status === 422 && data.detail) {
        if (Array.isArray(data.detail)) {
          // Format validation errors dari FastAPI
          errorMessage = data.detail.map(err => {
            if (typeof err === 'string') return err;
            if (err && typeof err === 'object') {
              if (err.msg) {
                const loc = err.loc ? (Array.isArray(err.loc) ? err.loc.join('.') : String(err.loc)) : 'Field';
                return `${loc}: ${err.msg}`;
              }
              return JSON.stringify(err);
            }
            return String(err);
          }).join(', ');
        } else if (typeof data.detail === 'object' && data.detail !== null) {
          // Jika detail adalah object, format dengan lebih baik
          errorMessage = Object.entries(data.detail)
            .map(([key, value]) => {
              let valStr = '';
              if (Array.isArray(value)) {
                valStr = value.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(', ');
              } else if (typeof value === 'object' && value !== null) {
                valStr = JSON.stringify(value);
              } else {
                valStr = String(value);
              }
              return `${key}: ${valStr}`;
            })
            .join('; ');
        } else {
          errorMessage = String(data.detail);
        }
      } else {
        // Handle other errors
        let rawMessage = data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Pastikan errorMessage selalu string
        if (typeof rawMessage === 'string') {
          errorMessage = rawMessage;
        } else if (Array.isArray(rawMessage)) {
          errorMessage = rawMessage.map(m => typeof m === 'string' ? m : JSON.stringify(m)).join(', ');
        } else if (typeof rawMessage === 'object' && rawMessage !== null) {
          errorMessage = JSON.stringify(rawMessage);
        } else {
          errorMessage = String(rawMessage);
        }
      }
    } catch (parseError) {
      // Jika tidak bisa parse JSON, gunakan status text
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
    }
    
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (err) {
    return {};
  }
}

export const authService = {
  /**
   * Login ke backend.
   * POST {API_BASE_URL}/auth/login
   * body: { email, password }
   * response: { access_token, token_type }
   */
  login: async (email, password) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    // Add timeout untuk prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await handleResponse(res);

    const token = data.access_token;
    if (!token) {
      throw new Error('Token tidak ditemukan di response login');
    }

    // Simpan user data dari response (jika ada) atau minimal email
    // Backend mungkin mengembalikan user data dengan role
    let userData = data.user || { email };
    
    // Jika response tidak include user data lengkap, simpan minimal email
    if (!userData.email) {
      userData.email = email;
    }

    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

      // Coba fetch user data dari /me endpoint jika tersedia (untuk mendapatkan role dll)
      try {
        const meData = await authService.getCurrentUserData();
        if (meData) {
          userData = meData;
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        }
      } catch (err) {
        // Jika /me endpoint tidak tersedia atau error, gunakan data dari login response
        console.log('Tidak bisa fetch user data dari /me endpoint:', err);
      }

      return { success: true, user: userData, token };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timeout - server tidak merespons. Periksa koneksi internet atau coba lagi.');
      }
      throw err;
    }
  },

  /**
   * Register ke backend.
   * POST {API_BASE_URL}/auth/register
   * body: { full_name, email, phone_e164, password, locale }
   */
  register: async (name, email, password, phone = '', locale = 'id') => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: name,
        email,
        phone_e164: phone || undefined,
        password,
        locale
      })
    });

    const data = await handleResponse(res);

    // Tidak auto-login; FE akan redirect ke halaman login.
    return { success: true, user: data };
  },

  // cek apakah user sudah punya token
  isAuthenticated: () => {
    const token = localStorage.getItem(AUTH_KEY);
    return !!token;
  },

  // ambil user dari localStorage
  getCurrentUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // ambil token saat mau call API lain
  getToken: () => localStorage.getItem(AUTH_KEY),

  // fetch user data dari endpoint /me (jika tersedia)
  getCurrentUserData: async () => {
    if (!API_BASE_URL) {
      return null;
    }

    const token = authService.getToken();
    if (!token) {
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const userData = await handleResponse(res);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        return userData;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      // Silent fail - tidak critical jika /me tidak tersedia
      console.log('Tidak bisa fetch user data dari /me endpoint:', err.message);
    }

    return null;
  },

  /**
   * Ambil profil user (fresh) dari backend
   * GET {API_BASE_URL}/auth/me
   */
  getProfile: async () => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const token = authService.getToken();
    if (!token) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await handleResponse(res);
      // Sinkronkan ke localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timeout saat mengambil profil');
      }
      throw err;
    }
  },

  /**
   * Update profil user
   * PUT {API_BASE_URL}/auth/profile
   */
  updateProfile: async (profileData) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const token = authService.getToken();
    if (!token) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik

    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await handleResponse(res);
      // Simpan user terbaru
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timeout saat menyimpan profil');
      }
      throw err;
    }
  },

  // logout
  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // cek apakah user adalah admin
  // TODO: Update ini untuk mengambil role dari backend API atau dari user data
  isAdmin: () => {
    const user = authService.getCurrentUser();
    // Sementara cek dari user data, bisa di-upgrade untuk ambil dari backend
    return user && (user.role === 'admin' || user.is_admin === true);
  },

  // cek apakah user adalah industry
  isIndustry: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'industry';
  }
};


