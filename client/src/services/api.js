const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Standard HTTP client with automatic credentials (cookies) inclusion
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: 'include', // Automatically send and receive HttpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
};

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Auth Endpoints
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getCurrentUser: () => request('/auth/me'),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  // Jobs Endpoints
  getJobs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.location) query.append('location', params.location);
    if (params.employmentType) query.append('employmentType', params.employmentType);
    const queryString = query.toString();
    return request(`/jobs${queryString ? `?${queryString}` : ''}`);
  },

  getJobById: (id) => request(`/jobs/${id}`),

  createJob: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  getMyJobs: () => request('/jobs/employer/my-jobs'),

  deleteJob: (id) =>
    request(`/jobs/${id}`, {
      method: 'DELETE',
    }),

  // Applications Endpoints
  applyForJob: (jobId, formData) => {
    // Send multipart/form-data without setting Content-Type header so browser adds boundary
    const url = `${API_BASE_URL}/applications/${jobId}`;
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.message || 'Application submission failed.');
        error.status = response.status;
        throw error;
      }
      return data;
    });
  },

  getMyApplications: () => request('/applications/my-applications'),

  getJobApplicants: (jobId) => request(`/applications/employer/job/${jobId}`),

  updateApplicationStatus: (applicationId, status) =>
    request(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getResumeDownloadUrl: (applicationId) => `${API_BASE_URL}/applications/${applicationId}/resume`,
};

export default api;
