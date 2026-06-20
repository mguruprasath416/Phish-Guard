const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ── Get All Threat Reports ────────────────────────────────────────────────

export const getThreatReports = async (threatLevel = null, limit = 20, skip = 0) => {
  const params = new URLSearchParams();
  if (threatLevel) params.append('threatLevel', threatLevel);
  params.append('limit', limit);
  params.append('skip', skip);

  const response = await fetch(`${API_BASE_URL}/reports?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch threat reports');
  }

  return data;
};

// ── Get Threat Report by ID ──────────────────────────────────────────────

export const getThreatReport = async (id) => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch threat report');
  }

  return data;
};

// ── Get Threat Statistics ───────────────────────────────────────────────

export const getThreatStats = async (period = '30d') => {
  const response = await fetch(`${API_BASE_URL}/reports/stats/overview?period=${period}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch threat statistics');
  }

  return data;
};

// ── Update Threat Report ─────────────────────────────────────────────────

export const updateThreatReport = async (id, updates) => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update threat report');
  }

  return data;
};
