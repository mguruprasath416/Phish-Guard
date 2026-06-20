import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, LinearProgress, Chip, Divider,
  CircularProgress, Avatar, Button
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  AccessTime as AccessTimeIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/* ── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, subColor, delay = 0 }) => (
  <Paper
    className="anim-fade-up"
    sx={{
      p: 2.5, borderRadius: '16px',
      background: '#fff',
      border: '1px solid #f0f0f0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      animationDelay: `${delay}ms`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(0,0,0,0.08)' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: '12px',
        background: icon.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon.el}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', mb: 0.3 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1, mb: 0.3 }}>
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: subColor || '#6b7280' }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
);

const Dashboard = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/simulations');
      setSimulations(res.data);
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const safeCount = simulations.filter(s => !s.isPhishing).length;
  const phishCount = simulations.filter(s => s.isPhishing).length;
  const totalCount = simulations.length;

  const phishPercent = totalCount > 0 ? Math.round((phishCount / totalCount) * 100) : 0;
  const safePercent = totalCount > 0 ? Math.round((safeCount / totalCount) * 100) : 0;

  // Session activity logs (using user details)
  const activityLogs = [
    {
      icon: <ComputerIcon sx={{ color: '#10b981' }} />,
      title: 'Active Session Authenticated',
      desc: `Logged in from web application using token auth`,
      time: 'Just Now',
      ip: '127.0.0.1'
    },
    {
      icon: <VpnKeyIcon sx={{ color: '#3b82f6' }} />,
      title: 'Email Verified Successfully',
      desc: 'Completed double-opt-in email security check',
      time: user?.verifiedAt ? new Date(user.verifiedAt).toLocaleString() : 'N/A',
      ip: '127.0.0.1'
    },
    {
      icon: <PersonIcon sx={{ color: '#6b7280' }} />,
      title: 'Account Registered',
      desc: 'Created secure user profile in MongoDB databases',
      time: user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A',
      ip: '127.0.0.1'
    }
  ].filter(log => log.time !== 'N/A');

  const stats = [
    {
      icon: { bg: '#dcfce7', el: <CheckCircleIcon sx={{ fontSize: 22, color: '#16a34a' }} /> },
      label: 'Legit Emails Verified',
      value: safeCount,
      sub: totalCount > 0 ? `${safePercent}% of total scans` : 'All clear',
      subColor: '#16a34a',
      delay: 0
    },
    {
      icon: { bg: '#fee2e2', el: <ErrorIcon sx={{ fontSize: 22, color: '#dc2626' }} /> },
      label: 'Fake / Phishing Flagged',
      value: phishCount,
      sub: totalCount > 0 ? `${phishPercent}% of total scans` : 'Zero threats',
      subColor: '#dc2626',
      delay: 80
    },
    {
      icon: { bg: '#dbeafe', el: <BarChartIcon sx={{ fontSize: 22, color: '#2563eb' }} /> },
      label: 'Total Security Scans',
      value: totalCount,
      sub: 'Email threat database',
      subColor: '#2563eb',
      delay: 160
    }
  ];

  return (
    <Box sx={{ background: '#0e0e0e', minHeight: 'calc(100vh - 64px)', pb: 5 }}>
      {/* ── Header ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d2a20 0%, #14332a 60%, #1a4535 100%)',
        px: { xs: 3, md: 5 }, py: { xs: 3, md: 4.5 },
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(74,222,128,0.05)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -20, right: 120, width: 120, height: 120, borderRadius: '50%', background: 'rgba(74,222,128,0.04)', pointerEvents: 'none' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#2a7a55', width: 52, height: 52, border: '2px solid rgba(255,255,255,0.2)', fontSize: 20, fontWeight: 800 }}>
            {(user?.email?.split('@')[0]?.[0] || user?.name?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Welcome back, {user?.email?.split('@')[0] || user?.name}!
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, mt: 0.5 }}>
              Security Center status: <strong style={{ color: '#4ade80' }}>Shield Active</strong> · Role: {user?.role || 'user'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Stats Row ── */}
      <Box sx={{ background: '#111', px: { xs: 3, md: 5 }, py: 3, borderBottom: '1px solid #1a1a1a' }}>
        <Grid container spacing={3}>
          {stats.map((s, i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── Main content grid ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
        <Grid container spacing={4}>
          
          {/* Left Column: Security Health & Analytics */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper sx={{ p: 5, borderRadius: '16px', border: '1px solid #e5e7eb', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', minHeight: '600px' }}>
              <Typography sx={{ fontWeight: 850, fontSize: 20, color: '#111', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon sx={{ color: '#16a34a', fontSize: 28 }} /> Security Threat Proportions
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 4 }}>
                Proportion of analyzed emails classified as legitimate or phishing attempts.
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress color="success" />
                </Box>
              ) : (
                <Box>
                  {/* Legit Emails Percentage */}
                  <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#15803d', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon /> Safe & Legit Emails
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#15803d' }}>
                        {safeCount}/{totalCount}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={safePercent}
                      sx={{
                        height: 16, borderRadius: 8, background: '#dcfce7',
                        '& .MuiLinearProgress-bar': { background: '#16a34a', borderRadius: 8 }
                      }}
                    />
                  </Box>

                  {/* Phishing Emails Percentage */}
                  <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorIcon /> Fake / Phishing Attacks Blocked
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#b91c1c' }}>
                        {phishCount}/{totalCount}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={phishPercent}
                      sx={{
                        height: 16, borderRadius: 8, background: '#fee2e2',
                        '& .MuiLinearProgress-bar': { background: '#dc2626', borderRadius: 8 }
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Recent Activity Mini List */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#374151' }}>
                      Recent Security Scans
                    </Typography>
                    <Button
                      size="medium" onClick={() => navigate('/history')} endIcon={<ArrowForwardIcon />}
                      sx={{ textTransform: 'none', fontWeight: 700, color: '#2a7a55', fontSize: 14 }}
                    >
                      View All Logs
                    </Button>
                  </Box>

                  {simulations.length === 0 ? (
                    <Typography sx={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', py: 4 }}>
                      No scan simulations recorded yet.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {simulations.slice(0, 3).map((s) => (
                        <Box key={s._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                            {s.isPhishing ? <ErrorIcon color="error" /> : <CheckCircleIcon color="success" />}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#374151', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {s.subject}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                                {s.sender}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={s.isPhishing ? 'Phishing' : 'Safe'} size="small"
                            sx={{
                              fontSize: 12, fontWeight: 800, px: 1, py: 1.5,
                              background: s.isPhishing ? '#fee2e2' : '#dcfce7',
                              color: s.isPhishing ? '#dc2626' : '#16a34a'
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column: User Session Activity Logs */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper sx={{ p: 5, borderRadius: '16px', border: '1px solid #e5e7eb', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', minHeight: '600px' }}>
              <Typography sx={{ fontWeight: 850, fontSize: 20, color: '#111', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon sx={{ color: '#2563eb', fontSize: 28 }} /> Access & Session Activity
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 5 }}>
                Track session connections, log devices, and account credential states.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
                {/* Timeline connector line */}
                <Box sx={{ position: 'absolute', top: 20, bottom: 20, left: 22, width: 3, background: '#f3f4f6', zIndex: 0 }} />

                {activityLogs.map((log, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{
                      width: 46, height: 46, borderRadius: '50%', background: '#f9fafb',
                      border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {log.icon}
                    </Box>
                    <Box sx={{ flex: 1, pt: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>
                          {log.title}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14 }} /> {log.time}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14, color: '#6b7280', mt: 0.5 }}>
                        {log.desc}
                      </Typography>
                      <Chip label={`IP: ${log.ip}`} size="small" sx={{ mt: 1.5, fontSize: 11, height: 22, background: '#f3f4f6', color: '#6b7280', fontWeight: 700, px: 1 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
