import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { CheckCircle, Cancel, Shield, Login, Refresh } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { verifyEmailToken } = useAuth();
    const hasCalledRef = useRef(false);

    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'expired' | 'error'
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (hasCalledRef.current) return;
        hasCalledRef.current = true;

        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token found in the URL.');
                return;
            }

            const result = await verifyEmailToken(token);

            if (result.success) {
                setStatus('success');
                setMessage(result.message || 'Email verified successfully!');
            } else if (result.expired) {
                setStatus('expired');
                setMessage(result.error || 'Verification link has expired.');
            } else {
                setStatus('error');
                setMessage(result.error || 'Invalid verification link.');
            }
        };

        verify();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        let timer;
        if (status === 'success') {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/login');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [status, navigate]);

    const bgSx = {
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 40%, rgba(26,69,53,0.5) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(42,122,85,0.2) 0%, transparent 50%), #080e09',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    };

    const configs = {
        loading: {
            icon: <CircularProgress size={52} sx={{ color: '#4ade80' }} />,
            title: 'Verifying your email…',
            subtitle: 'Please wait while we confirm your email address.',
            color: '#4ade80',
            actions: null
        },
        success: {
            icon: <CheckCircle sx={{ fontSize: 64, color: '#4ade80' }} />,
            title: 'Email Verified! 🎉',
            subtitle: `Your email has been successfully verified. Redirecting to login in ${countdown} seconds...`,
            color: '#4ade80',
            actions: (
                <Box>
                    <Button
                        fullWidth variant="contained"
                        startIcon={<Login />}
                        onClick={() => navigate('/login')}
                        sx={{
                            mt: 3, py: 1.5, fontSize: 15, fontWeight: 700, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
                            boxShadow: '0 4px 20px rgba(22,163,74,0.4)',
                            '&:hover': { background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', boxShadow: '0 4px 28px rgba(22,163,74,0.6)' }
                        }}
                    >
                        Sign In Now
                    </Button>
                </Box>
            )
        },
        expired: {
            icon: <Cancel sx={{ fontSize: 64, color: '#f59e0b' }} />,
            title: 'Link Expired',
            subtitle: 'Your verification link has expired. Please request a new one.',
            color: '#f59e0b',
            actions: (
                <Box>
                    <Button
                        fullWidth variant="contained"
                        startIcon={<Refresh />}
                        onClick={() => navigate('/register')}
                        sx={{
                            mt: 3, mb: 1.5, py: 1.5, fontSize: 15, fontWeight: 700, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
                            boxShadow: '0 4px 20px rgba(217,119,6,0.4)',
                            '&:hover': { background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)' }
                        }}
                    >
                        Request New Verification Email
                    </Button>
                    <Button
                        fullWidth size="small"
                        onClick={() => navigate('/login')}
                        sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'rgba(255,255,255,0.6)' } }}
                    >
                        Back to Sign In
                    </Button>
                </Box>
            )
        },
        error: {
            icon: <Cancel sx={{ fontSize: 64, color: '#ef4444' }} />,
            title: 'Verification Failed',
            subtitle: message || 'This verification link is invalid or has already been used.',
            color: '#ef4444',
            actions: (
                <Box>
                    <Button
                        fullWidth variant="outlined"
                        onClick={() => navigate('/register')}
                        sx={{
                            mt: 3, mb: 1.5, py: 1.5, fontSize: 15, fontWeight: 700, borderRadius: '10px',
                            borderColor: 'rgba(239,68,68,0.4)', color: '#f87171',
                            '&:hover': { borderColor: '#ef4444', background: 'rgba(239,68,68,0.07)' }
                        }}
                    >
                        Register Again
                    </Button>
                    <Button
                        fullWidth size="small"
                        onClick={() => navigate('/login')}
                        sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'rgba(255,255,255,0.6)' } }}
                    >
                        Back to Sign In
                    </Button>
                </Box>
            )
        }
    };

    const cfg = configs[status];

    return (
        <Box sx={bgSx}>
            {/* BG orbs */}
            <Box sx={{ position: 'fixed', top: '8%', right: '10%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(42,122,85,0.07)', filter: 'blur(70px)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'fixed', bottom: '10%', left: '6%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(74,222,128,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <Container maxWidth="sm">
                {/* Logo */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #14332a 0%, #2a7a55 100%)', boxShadow: '0 8px 32px rgba(42,122,85,0.5)', mb: 2 }}>
                        <Shield sx={{ fontSize: 32, color: '#4ade80' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 11 }}>
                        PhishGuard Security
                    </Typography>
                </Box>

                <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: '20px', background: 'rgba(10,18,12,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(42,122,85,0.15)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', textAlign: 'center' }}>
                    {/* Status icon */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, borderRadius: '50%', background: `rgba(${status === 'success' ? '42,122,85' : status === 'expired' ? '217,119,6' : '239,68,68'},0.12)`, border: `2px solid ${cfg.color}33` }}>
                            {cfg.icon}
                        </Box>
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: '#f9fafb', letterSpacing: '-0.5px' }}>
                        {cfg.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                        {cfg.subtitle}
                    </Typography>

                    {cfg.actions}
                </Paper>
            </Container>
        </Box>
    );
};

export default VerifyEmail;
