import React, { useState } from 'react';
import {
    Container, Paper, TextField, Button, Typography, Box, Alert,
    IconButton, InputAdornment, LinearProgress, Divider
} from '@mui/material';
import {
    Visibility, VisibilityOff, Email, Lock, Person, CheckCircle,
    Shield, MarkEmailRead, Refresh
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

/* ── Password strength ───────────────────────────────────────────────────────── */
const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let s = 0;
    if (pw.length >= 8)       s++;
    if (pw.length >= 12)      s++;
    if (/[A-Z]/.test(pw))    s++;
    if (/[0-9]/.test(pw))    s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const map = [
        { score: 20, label: 'Very Weak',   color: '#ef4444' },
        { score: 20, label: 'Very Weak',   color: '#ef4444' },
        { score: 40, label: 'Weak',         color: '#f97316' },
        { score: 60, label: 'Fair',         color: '#f59e0b' },
        { score: 80, label: 'Strong',       color: '#16a34a' },
        { score: 100, label: 'Very Strong', color: '#06b6d4' },
    ];
    return map[s];
};

/* ── Shared input sx ─────────────────────────────────────────────────────────── */
const inputSx = {
    '& .MuiOutlinedInput-root': {
        background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
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
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.35)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4ade80' },
    '& .MuiFormHelperText-root': { color: '#f87171' },
};

/* ── Register Component ──────────────────────────────────────────────────────── */
const Register = () => {
    const [step, setStep]             = useState('register'); // 'register' | 'sent'
    const [name, setName]             = useState('');
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [confirmPw, setConfirmPw]   = useState('');
    const [showPw, setShowPw]         = useState(false);
    const [showCPw, setShowCPw]       = useState(false);
    const [valError, setValError]     = useState('');
    const [devToken, setDevToken]     = useState('');
    const [resendMsg, setResendMsg]   = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    const { register, googleLogin, resendVerification, loading, error, clearError } = useAuth();
    const navigate = useNavigate();
    const strength = getStrength(password);

    /* ── Submit registration ── */
    const handleRegister = async (e) => {
        e.preventDefault();
        setValError('');
        clearError();

        if (name.trim().length < 2) return setValError('Name must be at least 2 characters');
        if (password !== confirmPw)   return setValError('Passwords do not match');
        if (password.length < 6)      return setValError('Password must be at least 6 characters');

        const res = await register(name.trim(), email.trim(), password);
        if (res.success) {
            setStep('sent');
            if (res.devToken) setDevToken(res.devToken);
        }
    };

    /* ── Resend from "sent" step ── */
    const handleResend = async () => {
        setResendLoading(true);
        setResendMsg('');
        const res = await resendVerification(email);
        setResendLoading(false);
        if (res.success) {
            setResendMsg(res.message);
            if (res.devToken) setDevToken(res.devToken);
        }
    };

    /* ── BG style ── */
    const bgSx = {
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 40%, rgba(26,69,53,0.5) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(42,122,85,0.2) 0%, transparent 50%), #080e09',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    };

    /* ════════════════════════════════════════════════════════════
       Step: "sent" — Email verification sent
    ════════════════════════════════════════════════════════════ */
    if (step === 'sent') {
        return (
            <Box sx={bgSx}>
                <Box sx={{ position: 'fixed', top: '8%', right: '10%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(42,122,85,0.07)', filter: 'blur(70px)', pointerEvents: 'none' }} />
                <Box sx={{ position: 'fixed', bottom: '10%', left: '6%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(74,222,128,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />

                <Container maxWidth="sm">
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #14332a 0%, #2a7a55 100%)', boxShadow: '0 8px 32px rgba(42,122,85,0.5)', mb: 2 }}>
                            <Shield sx={{ fontSize: 32, color: '#4ade80' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 11 }}>
                            PhishGuard Security
                        </Typography>
                    </Box>

                    <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: '20px', background: 'rgba(10,18,12,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(42,122,85,0.15)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', textAlign: 'center' }}>
                        {/* Icon */}
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 88, height: 88, borderRadius: '50%', background: 'rgba(42,122,85,0.12)', border: '2px solid rgba(74,222,128,0.25)', mb: 3, mx: 'auto' }}>
                            <MarkEmailRead sx={{ fontSize: 44, color: '#4ade80' }} />
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#f9fafb', letterSpacing: '-0.5px' }}>
                            Check your inbox!
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 0.5, lineHeight: 1.7 }}>
                            We've sent a verification email to
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#4ade80', fontWeight: 700, mb: 3 }}>
                            {email}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', mb: 3, lineHeight: 1.7 }}>
                            Click the link in the email to verify your account. The link expires in <strong style={{ color: 'rgba(255,255,255,0.5)' }}>24 hours</strong>.
                        </Typography>

                        {/* Dev token fallback */}
                        {devToken && (
                            <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#93c5fd', textAlign: 'left', fontSize: 13 }}>
                                <strong>Dev Mode:</strong> Email service not configured.<br />
                                <a href={`/verify-email/${devToken}`} style={{ color: '#60a5fa', wordBreak: 'break-all' }}>
                                    Click here to verify manually →
                                </a>
                            </Alert>
                        )}

                        {resendMsg && (
                            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2, borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}>
                                {resendMsg}
                            </Alert>
                        )}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#fca5a5' }}>
                                {error}
                            </Alert>
                        )}

                        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', mb: 2 }}>
                            Didn't receive the email?
                        </Typography>

                        <Button
                            variant="outlined"
                            startIcon={<Refresh sx={{ fontSize: 16 }} />}
                            disabled={resendLoading || loading}
                            onClick={handleResend}
                            sx={{
                                mb: 2, borderRadius: '10px', borderColor: 'rgba(74,222,128,0.3)',
                                color: '#4ade80', fontWeight: 700,
                                '&:hover': { borderColor: '#4ade80', background: 'rgba(74,222,128,0.07)' },
                                '&:disabled': { opacity: 0.4 }
                            }}
                        >
                            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                        </Button>

                        <Box>
                            <Button
                                size="small"
                                onClick={() => navigate('/login')}
                                sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'rgba(255,255,255,0.7)' } }}
                            >
                                Back to Sign In
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        );
    }

    /* ════════════════════════════════════════════════════════════
       Step: "register" — Registration form
    ════════════════════════════════════════════════════════════ */
    return (
        <Box sx={bgSx}>
            <Box sx={{ position: 'fixed', top: '8%', right: '10%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(42,122,85,0.07)', filter: 'blur(70px)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'fixed', bottom: '10%', left: '6%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(74,222,128,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <Container maxWidth="sm">
                <Box className="anim-fade-up">
                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #14332a 0%, #2a7a55 100%)', boxShadow: '0 8px 32px rgba(42,122,85,0.5)', mb: 2 }}>
                            <Shield sx={{ fontSize: 32, color: '#4ade80' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 11 }}>
                            PhishGuard Security
                        </Typography>
                    </Box>

                    <Paper sx={{ p: { xs: 3, sm: 4.5 }, borderRadius: '20px', background: 'rgba(10,18,12,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(42,122,85,0.15)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px', color: '#f9fafb' }}>
                            Create account
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', mb: 3 }}>
                            Join the PhishGuard security platform
                        </Typography>

                        {(error || valError) && (
                            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#fca5a5', '& .MuiAlert-icon': { color: '#f87171' } }}>
                                {error || valError}
                            </Alert>
                        )}

                        <form onSubmit={handleRegister}>
                            {/* Full Name */}
                            <TextField
                                fullWidth label="Full name" type="text" value={name}
                                onChange={e => { setName(e.target.value); clearError(); }}
                                margin="normal" required placeholder="John Doe"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }} /></InputAdornment> }}
                                sx={inputSx}
                            />

                            {/* Email */}
                            <TextField
                                fullWidth label="Email address" type="email" value={email}
                                onChange={e => { setEmail(e.target.value); clearError(); }}
                                margin="normal" required placeholder="you@example.com"
                                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }} /></InputAdornment> }}
                                sx={inputSx}
                            />

                            {/* Password */}
                            <TextField
                                fullWidth label="Password" type={showPw ? 'text' : 'password'} value={password}
                                onChange={e => { setPassword(e.target.value); clearError(); }}
                                margin="normal" required placeholder="Min. 6 characters"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }} /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPw(v => !v)} edge="end" sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#4ade80' } }}>
                                                {showPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputSx}
                            />

                            {/* Password strength */}
                            {password && (
                                <Box sx={{ mt: 1, mb: 0.5 }}>
                                    <LinearProgress
                                        variant="determinate" value={strength.score}
                                        sx={{
                                            height: 4, borderRadius: 2,
                                            background: 'rgba(255,255,255,0.06)',
                                            '& .MuiLinearProgress-bar': { background: strength.color, borderRadius: 2, transition: 'all 0.4s ease' }
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: strength.color, fontWeight: 700, display: 'block', mt: 0.5 }}>
                                        {strength.label}
                                    </Typography>
                                </Box>
                            )}

                            {/* Confirm password */}
                            <TextField
                                fullWidth label="Confirm password" type={showCPw ? 'text' : 'password'} value={confirmPw}
                                onChange={e => { setConfirmPw(e.target.value); clearError(); }}
                                margin="normal" required placeholder="Re-enter your password"
                                error={confirmPw.length > 0 && password !== confirmPw}
                                helperText={confirmPw.length > 0 && password !== confirmPw ? 'Passwords do not match' : ''}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }} /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowCPw(v => !v)} edge="end" sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#4ade80' } }}>
                                                {showCPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputSx}
                            />

                            <Button
                                fullWidth type="submit" variant="contained" disabled={loading}
                                sx={{
                                    mt: 3, py: 1.5, fontSize: 15, fontWeight: 700, borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
                                    boxShadow: '0 4px 20px rgba(22,163,74,0.4)',
                                    '&:hover': { background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', boxShadow: '0 4px 28px rgba(22,163,74,0.6)' },
                                    '&:disabled': { opacity: 0.6 }
                                }}
                            >
                                {loading ? 'Creating account...' : 'Create Account →'}
                            </Button>
                        </form>

                        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)', '&::before,&::after': { borderColor: 'rgba(255,255,255,0.05)' } }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>or</Typography>
                        </Divider>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    clearError();
                                    const result = await googleLogin(credentialResponse.credential);
                                    if (result.success) navigate('/dashboard');
                                }}
                                onError={() => setValError('Google Registration failed')}
                                theme="filled_black"
                                shape="pill"
                                text="signup_with"
                            />
                        </Box>
                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
                            Already have an account?{' '}
                            <Box component="span" onClick={() => navigate('/login')} sx={{ color: '#4ade80', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                Sign in
                            </Box>
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default Register;
