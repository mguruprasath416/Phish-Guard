import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Chip, CircularProgress, Divider,
  IconButton, Collapse
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { RenderAnalysisReport } from './Analyze';

const History = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRows, setOpenRows] = useState({});
  const { user } = useAuth();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/simulations');
      setSimulations(res.data);
    } catch (e) {
      console.error('Error fetching scan history:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const toggle = (id) => setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <Box sx={{ background: '#0e0e0e', minHeight: 'calc(100vh - 64px)', pb: 5 }}>
      {/* Header Banner */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d2a20 0%, #14332a 60%, #1a4535 100%)',
        px: { xs: 3, md: 5 }, py: { xs: 3, md: 4 },
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(74,222,128,0.05)', pointerEvents: 'none' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Security Audit Logs
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, mt: 0.5 }}>
              Browse, inspect, and audit all email simulations and domain scans in your security history.
            </Typography>
          </Box>
          <IconButton onClick={fetchHistory} sx={{ background: 'rgba(255,255,255,0.08)', color: '#fff', '&:hover': { background: 'rgba(255,255,255,0.15)' } }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Audit Log Rows List */}
      <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="success" />
          </Box>
        ) : simulations.length === 0 ? (
          <Paper sx={{ p: 6, borderRadius: '16px', border: '1.5px dashed #d1d5db', background: 'rgba(255,255,255,0.45)', textAlign: 'center', py: 8 }}>
            <HistoryIcon sx={{ fontSize: 52, color: '#9ca3af', mb: 2 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#374151', mb: 1 }}>
              No Audits Registered
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#6b7280', maxWidth: 300, mx: 'auto', lineHeight: 1.6 }}>
              Scan URLs or Emails in the <strong>Threat Intelligence Center</strong> to record your first audit log entry.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: 13, color: '#9ca3af', fontWeight: 700, mb: 0.5 }}>
              TOTAL AUDITS RECORDED: {simulations.length}
            </Typography>
            {simulations.map((s) => (
              <Box key={s._id} sx={{
                borderRadius: '14px', background: '#fff', border: '1px solid #e5e7eb',
                overflow: 'hidden', transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }
              }}>
                <Box
                  onClick={() => toggle(s._id)}
                  sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2, cursor: 'pointer' }}
                >
                  <Box sx={{
                    width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                    background: s.isPhishing ? '#fee2e2' : '#dcfce7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {s.isPhishing
                      ? <WarningIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                      : <CheckCircleIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                    }
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1f2937', noWrap: true }}>
                      {s.subject}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                      Sender: {s.sender} · {new Date(s.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={s.isPhishing ? 'Phishing' : 'Safe'}
                    size="small"
                    sx={{
                      background: s.isPhishing ? '#fee2e2' : '#dcfce7',
                      color: s.isPhishing ? '#dc2626' : '#16a34a',
                      fontWeight: 800, fontSize: 11, mr: 1,
                    }}
                  />
                  {openRows[s._id] ? <ArrowUpIcon fontSize="small" sx={{ color: '#9ca3af' }} /> : <ArrowDownIcon fontSize="small" sx={{ color: '#9ca3af' }} />}
                </Box>

                <Collapse in={!!openRows[s._id]}>
                  <Divider />
                  <Box sx={{ p: 2.5, background: '#fafaf9', borderTop: '1px solid #f0f0f0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4b5563', mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                      Audit Analysis Report
                    </Typography>
                    
                    <RenderAnalysisReport 
                      sender={s.sender} 
                      subject={s.subject} 
                      body={s.body} 
                      date={s.createdAt}
                      dbId={s._id}
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4b5563', mb: 0.8, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                      Original Email Body Content
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: '#374151', lineHeight: 1.6, background: '#fff', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}>
                      {s.body}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default History;
