// src/services/admin.js
// Admin service: konsumsi API backend untuk admin endpoints

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const data = await response.json();
      
      // Handle FastAPI validation errors (422) - detail bisa berupa array atau object
      if (response.status === 422 && data.detail) {
        if (Array.isArray(data.detail)) {
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
        let rawMessage = data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`;
        
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
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
    }
    
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new Error('Invalid response format from server');
  }
}

export const adminService = {
  /**
   * Get spreadsheet data dengan pagination
   * GET {API_BASE_URL}/admin/spreadsheet/data
   */
  getSpreadsheetData: async (token, options = {}) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const { worksheetName = 'Sheet1', limit, offset = 0, includeProcessed = false } = options;
    
    const params = new URLSearchParams({
      worksheet_name: worksheetName,
      offset: offset.toString(),
      include_processed: includeProcessed.toString()
    });
    
    if (limit) {
      params.append('limit', limit.toString());
    }

    const res = await fetch(`${API_BASE_URL}/admin/spreadsheet/data?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return handleResponse(res);
  },

  /**
   * Get latest spreadsheet data
   * GET {API_BASE_URL}/admin/spreadsheet/latest
   */
  getLatestSpreadsheetData: async (token, worksheetName = 'Sheet1', includeProcessed = true) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const params = new URLSearchParams({
      worksheet_name: worksheetName,
      include_processed: includeProcessed.toString()
    });

    const res = await fetch(`${API_BASE_URL}/admin/spreadsheet/latest?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return handleResponse(res);
  },

  /**
   * Get spreadsheet statistics
   * GET {API_BASE_URL}/admin/spreadsheet/stats
   */
  getSpreadsheetStats: async (token, worksheetName = 'Sheet1') => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const params = new URLSearchParams({
      worksheet_name: worksheetName
    });

    const res = await fetch(`${API_BASE_URL}/admin/spreadsheet/stats?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return handleResponse(res);
  },

  /**
   * Get admin dashboard info
   * GET {API_BASE_URL}/admin/dashboard
   */
  getDashboardInfo: async (token) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return handleResponse(res);
  },

  /**
   * Get all users
   * GET {API_BASE_URL}/admin/users
   */
  getUsers: async (token) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return handleResponse(res);
  },

  /**
   * Promote user to industry role
   * POST {API_BASE_URL}/admin/users/promote-industry
   */
  promoteToIndustry: async (token, userId) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const res = await fetch(`${API_BASE_URL}/admin/users/promote-industry`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId })
    });

    return handleResponse(res);
  },

  /**
   * Create new industry user
   * POST {API_BASE_URL}/admin/users/create-industry
   */
  createIndustryUser: async (token, userData) => {
    const url = `${API_BASE_URL}/admin/users/create-industry`;
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      return handleResponse(res);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error(`Failed to connect to backend. Please ensure the server is running at ${API_BASE_URL}`);
      }
      throw err;
    }
  },

  /**
   * Update user role
   * PUT {API_BASE_URL}/admin/users/{userId}/role
   */
  updateUserRole: async (token, userId, newRole) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role?new_role=${newRole}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return handleResponse(res);
  }
};

