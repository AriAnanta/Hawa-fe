/**
 * Feedback Service untuk Community Reports
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

export const feedbackService = {
  /**
   * Submit a new feedback/report
   * POST /feedback/submit
   */
  submitFeedback: async (token, formData, files = []) => {
    const form = new FormData();
    form.append('title', formData.title);
    form.append('description', formData.description);
    if (formData.location) form.append('location', formData.location);
    if (formData.latitude) form.append('latitude', formData.latitude);
    if (formData.longitude) form.append('longitude', formData.longitude);
    if (formData.category) form.append('category', formData.category);
    if (formData.severity) form.append('severity', formData.severity);
    form.append('is_anonymous', formData.is_anonymous || false);
    form.append('is_public', formData.is_public !== false);
    
    // Add files
    files.forEach((file) => {
      form.append('files', file);
    });

    const res = await fetch(`${API_BASE_URL}/feedback/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
    return handleResponse(res);
  },

  /**
   * Get community feed (public reports)
   * GET /feedback?limit=20&offset=0&category=...&severity=...&search=...&sort=newest
   */
  getCommunityFeed: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.category) queryParams.append('category', params.category);
    if (params.severity) queryParams.append('severity', params.severity);
    if (params.location) queryParams.append('location', params.location);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.status) queryParams.append('status', params.status);

    const res = await fetch(`${API_BASE_URL}/feedback?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(res);
  },

  /**
   * Get feedback detail
   * GET /feedback/{feedback_id}
   */
  getFeedbackDetail: async (token, feedbackId) => {
    const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(res);
  },

  /**
   * Vote on feedback
   * POST /feedback/{feedback_id}/vote
   */
  voteFeedback: async (token, feedbackId, voteType) => {
    const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/vote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vote_type: voteType })
    });
    return handleResponse(res);
  },

  /**
   * Get my reports
   * GET /feedback/my-reports?limit=20&offset=0&status=...
   */
  getMyReports: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.status) queryParams.append('status', params.status);

    const res = await fetch(`${API_BASE_URL}/feedback/my-reports?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(res);
  }
};







