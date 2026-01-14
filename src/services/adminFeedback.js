/**
 * Admin Feedback Service
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

export const adminFeedbackService = {
  /**
   * Get all feedback reports (admin only)
   * GET /admin/feedback?limit=20&offset=0&status=...&category=...&search=...
   */
  getAllFeedback: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/admin/feedback?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(res);
  },

  /**
   * Get feedback detail (admin only)
   * GET /admin/feedback/{feedback_id}
   */
  getFeedbackDetail: async (token, feedbackId) => {
    const res = await fetch(`${API_BASE_URL}/admin/feedback/${feedbackId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(res);
  },

  /**
   * Update feedback status
   * PUT /admin/feedback/{feedback_id}/status
   */
  updateFeedbackStatus: async (token, feedbackId, status, adminNotes = null) => {
    const res = await fetch(`${API_BASE_URL}/admin/feedback/${feedbackId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status,
        admin_notes: adminNotes
      })
    });
    return handleResponse(res);
  },

  /**
   * Update feedback admin notes
   * PUT /admin/feedback/{feedback_id}/notes
   */
  updateFeedbackNotes: async (token, feedbackId, adminNotes) => {
    const res = await fetch(`${API_BASE_URL}/admin/feedback/${feedbackId}/notes`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        admin_notes: adminNotes
      })
    });
    return handleResponse(res);
  },

  /**
   * Get feedback statistics
   * GET /admin/feedback/stats
   */
  getFeedbackStats: async (token) => {
    const res = await fetch(`${API_BASE_URL}/admin/feedback/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(res);
  }
};







