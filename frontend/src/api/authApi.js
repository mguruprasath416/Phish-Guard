const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Register ─────────────────────────────────────────────────────────────

export const register = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data;
};

// ── Login ───────────────────────────────────────────────────────────────

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // Store token in localStorage
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
};

// ── Google Login ─────────────────────────────────────────────────────────

export const googleLogin = async (idToken) => {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Google login failed');
  }

  // Store token in localStorage
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
};

// ── Logout ──────────────────────────────────────────────────────────────

export const logout = async () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email: user.email }),
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear localStorage regardless of API call success
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// ── Verify Email ─────────────────────────────────────────────────────────

export const verifyEmail = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify/${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Email verification failed');
  }

  return data;
};

// ── Resend Verification ───────────────────────────────────────────────────

export const resendVerification = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Resend verification failed');
  }

  return data;
};

// ── Get Current User ────────────────────────────────────────────────────

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ── Get Token ───────────────────────────────────────────────────────────

export const getToken = () => {
  return localStorage.getItem('token');
};

// ── Check if Authenticated ───────────────────────────────────────────────

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
