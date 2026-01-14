// Compliance service for industry users
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const data = await response.json();
      errorMessage = data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`;
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
    }
    throw new Error(errorMessage);
  }
  return await response.json();
}

export const complianceService = {
  /**
   * Create a new compliance record
   * POST {API_BASE_URL}/compliance/records
   */
  createRecord: async (token, recordData) => {
    const res = await fetch(`${API_BASE_URL}/compliance/records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recordData)
    });
    return handleResponse(res);
  },

  /**
   * Get compliance history
   * GET {API_BASE_URL}/compliance/records
   */
  getHistory: async (token, options = {}) => {
    const { limit = 50, offset = 0, startDate, endDate } = options;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const res = await fetch(`${API_BASE_URL}/compliance/records?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(res);
  },

  /**
   * Get compliance statistics
   * GET {API_BASE_URL}/compliance/stats
   */
  getStats: async (token, days = 30) => {
    const res = await fetch(`${API_BASE_URL}/compliance/stats?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(res);
  }
};







