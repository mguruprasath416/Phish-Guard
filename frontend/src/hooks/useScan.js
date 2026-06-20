import { useState } from 'react';
import { scanEmail, scanUrl, getScanHistory, getScanResult, submitFeedback } from '../api/scanApi';

export const useEmailScan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const scan = async (sender, subject, body, attachments = []) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await scanEmail(sender, subject, body, attachments);
      setResult(data.scanResult);
      setLoading(false);
      return data.scanResult;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { scan, loading, error, result };
};

export const useUrlScan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const scan = async (url) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await scanUrl(url);
      setResult(data.scanResult);
      setLoading(false);
      return data.scanResult;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { scan, loading, error, result };
};

export const useScanHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchHistory = async (scanType = null, limit = 20, skip = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getScanHistory(scanType, limit, skip);
      setHistory(data.scans);
      setTotal(data.total);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { fetchHistory, loading, error, history, total };
};

export const useScanResult = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const fetchResult = async (id) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await getScanResult(id);
      setResult(data.scanResult);
      setLoading(false);
      return data.scanResult;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { fetchResult, loading, error, result };
};

export const useFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (scanId, isFalsePositive, rating, comments) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await submitFeedback(scanId, isFalsePositive, rating, comments);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { submit, loading, error };
};
