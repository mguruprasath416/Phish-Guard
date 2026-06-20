const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ── Scan Email ───────────────────────────────────────────────────────────

export const scanEmail = async (sender, subject, body, attachments = []) => {
  const response = await fetch(`${API_BASE_URL}/scan/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ sender, subject, body, attachments }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Email scan failed');
  }

  return data;
};

// ── Scan URL ─────────────────────────────────────────────────────────────

export const scanUrl = async (url) => {
  const response = await fetch(`${API_BASE_URL}/scan/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'URL scan failed');
  }

  return data;
};

// ── Get Scan History ─────────────────────────────────────────────────────

export const getScanHistory = async (scanType = null, limit = 20, skip = 0) => {
  const params = new URLSearchParams();
  if (scanType) params.append('scanType', scanType);
  params.append('limit', limit);
  params.append('skip', skip);

  const response = await fetch(`${API_BASE_URL}/scan/history?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch scan history');
  }

  return data;
};

// ── Get Scan Result by ID ────────────────────────────────────────────────

export const getScanResult = async (id) => {
  const response = await fetch(`${API_BASE_URL}/scan/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch scan result');
  }

  return data;
};

// ── Submit Feedback ───────────────────────────────────────────────────────

export const submitFeedback = async (scanId, isFalsePositive, rating, comments) => {
  const response = await fetch(`${API_BASE_URL}/scan/${scanId}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ scanId, isFalsePositive, rating, comments }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to submit feedback');
  }

  return data;
};
