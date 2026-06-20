import React, { useState } from 'react';
import {
    Container, Paper, TextField, Button, Typography, Box,
    Alert, IconButton, InputAdornment, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Shield } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

/* ── Shared input sx ─────────────────────────────────────────────────────────── */
const inputSx = {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
    '&:hover fieldset': { borderColor: 'rgba(74,222,128,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#2a7a55 !important', borderWidth: '2px !important' },
    '& input': { 
        color: '#f1f5f9', 
        '&::placeholder': { color: 'rgba(255,255,255,0.2)' },
        '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px #141b16 inset !important',
            WebkitTextFillColor: '#f1f5f9 !important',
            transition: 'background-color 5000s ease-in-out 0s',
        }
    },
};

const Login = () => {
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError]     = useState('');

    const { login, googleLogin, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        clearError();

        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else if (result.requiresVerification) {
            setLocalError('Your email is not verified. Please check your inbox or register again to resend the verification email.');
        }
    };

    const bgStyle = {
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 40%, rgba(26,69,53,0.5) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(42,122,85,0.2) 0%, transparent 50%), #080e09',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
    };

    return (
        <Box sx={bgStyle}>
            {/* Background orbs */}
            <Box sx={{ position: 'fixed', top: '8%', right: '12%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(42,122,85,0.07)', filter: 'blur(70px)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'fixed', bottom: '12%', left: '8%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(74,222,128,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <Container maxWidth="sm">
                <Box className="anim-fade-up">
                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box sx={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 64, height: 64, borderRadius: '18px',
                            background: 'linear-gradient(135deg, #14332a 0%, #2a7a55 100%)',
                            boxShadow: '0 8px 32px rgba(42,122,85,0.5)',
                            mb: 2,
                        }}>
                            <Shield sx={{ fontSize: 32, color: '#4ade80' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 11 }}>
                            PhishGuard Security
                        </Typography>
                    </Box>

                    <Paper sx={{
                        p: { xs: 3, sm: 4.5 },
                        borderRadius: '20px',
                        background: 'rgba(10,18,12,0.92)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(42,122,85,0.15)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.03)',
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px', color: '#f9fafb' }}>
                            Welcome back
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
                            Sign in to your security dashboard
                        </Typography>

                        {(error || localError) && (
                            <Alert severity="error" sx={{
                                mb: 2.5, borderRadius: '10px',
                                background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
                                color: '#fca5a5', '& .MuiAlert-icon': { color: '#f87171' }
                            }}>
                                {error || localError}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth label="Email address" type="email"
                                value={email} onChange={e => { setEmail(e.target.value); clearError(); }}
                                margin="normal" required
                                placeholder="you@example.com"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }} />
                                        </InputAdornment>
                                    ),
                                    sx: inputSx
                                }}
                                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.35)', '&.Mui-focused': { color: '#4ade80' } } }}
                            />
                            <TextField
                                fullWidth label="Password" type={showPassword ? 'text' : 'password'}
                                value={password} onChange={e => { setPassword(e.target.value); clearError(); }}
                                margin="normal" required
                                placeholder="Your password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(v => !v)} edge="end"
                                                sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#4ade80' } }}
                                            >
                                                {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: inputSx
                                }}
                                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.35)', '&.Mui-focused': { color: '#4ade80' } } }}
                            />

                            <Button
                                fullWidth type="submit" variant="contained" disabled={loading}
                                sx={{
                                    mt: 3, py: 1.5, fontSize: 15, fontWeight: 700,
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
                                    boxShadow: '0 4px 20px rgba(22,163,74,0.4)',
                                    color: '#fff',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
                                        boxShadow: '0 4px 28px rgba(22,163,74,0.6)',
                                    },
                                    '&:disabled': { opacity: 0.6 }
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In →'}
                            </Button>
                        </form>

                        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)', '&::before, &::after': { borderColor: 'rgba(255,255,255,0.05)' } }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>or</Typography>
                        </Divider>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    clearError();
                                    const result = await googleLogin(credentialResponse.credential);
                                    if (result.success) navigate('/dashboard');
                                }}
                                onError={() => setLocalError('Google Login failed')}
                                theme="filled_black"
                                shape="pill"
                            />
                        </Box>

                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
                            Don't have an account?{' '}
                            <Box
                                component="span" onClick={() => navigate('/register')}
                                sx={{ color: '#4ade80', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Create account
                            </Box>
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default Login;
