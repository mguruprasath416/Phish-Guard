import { useState } from 'react';
import { getThreatReports, getThreatReport, getThreatStats, updateThreatReport } from '../api/reportApi';

export const useThreatReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchReports = async (threatLevel = null, limit = 20, skip = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getThreatReports(threatLevel, limit, skip);
      setReports(data.reports);
      setTotal(data.total);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { fetchReports, loading, error, reports, total };
};

export const useThreatReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const fetchReport = async (id) => {
    setLoading(true);
    setError(null);
    setReport(null);
    
    try {
      const data = await getThreatReport(id);
      setReport(data.report);
      setLoading(false);
      return data.report;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { fetchReport, loading, error, report };
};

export const useThreatStats = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchStats = async (period = '30d') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getThreatStats(period);
      setStats(data.stats);
      setLoading(false);
      return data.stats;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { fetchStats, loading, error, stats };
};

export const useUpdateReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await updateThreatReport(id, updates);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { update, loading, error };
};
