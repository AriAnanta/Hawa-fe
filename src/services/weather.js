// src/services/weather.js
// Weather recommendation service: konsumsi API backend untuk rekomendasi cuaca

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
    throw new Error('Invalid response format from server');
  }
}

export const weatherService = {
  /**
   * Get recommendation dari direct data
   * POST {API_BASE_URL}/weather/recommendation
   */
  getRecommendation: async (token, weatherData) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const res = await fetch(`${API_BASE_URL}/weather/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(weatherData)
    });

    return handleResponse(res);
  },

  /**
   * Get recommendation dari Google Sheets
   * POST {API_BASE_URL}/weather/recommendation/from-google-sheets
   */
  getRecommendationFromGoogleSheets: async (token, spreadsheetId, worksheetName = 'Sheet1') => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 detik untuk AI processing

    try {
      const res = await fetch(`${API_BASE_URL}/weather/recommendation/from-google-sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          spreadsheet_id: spreadsheetId,
          worksheet_name: worksheetName
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(res);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timeout - proses AI memakan waktu terlalu lama. Coba lagi atau periksa koneksi.');
      }
      throw err;
    }
  },

  /**
   * Get recommendation dari uploaded spreadsheet file
   * POST {API_BASE_URL}/weather/recommendation/from-spreadsheet
   */
  getRecommendationFromSpreadsheet: async (token, file) => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL belum dikonfigurasi');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 detik untuk AI processing

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/weather/recommendation/from-spreadsheet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return handleResponse(res);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timeout - proses AI memakan waktu terlalu lama. Coba lagi atau periksa koneksi.');
      }
      throw err;
    }
  }
};

