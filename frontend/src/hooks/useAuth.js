import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { login as loginApi, logout as logoutApi, register as registerApi, googleLogin as googleLoginApi } from '../api/authApi';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginApi(email, password);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { login, loading, error };
};

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await registerApi(name, email, password);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { register, loading, error };
};

export const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const googleLogin = async (idToken) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await googleLoginApi(idToken);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { googleLogin, loading, error };
};

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await logoutApi();
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { logout, loading, error };
};
