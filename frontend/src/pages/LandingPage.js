import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Paper, Slider,
  Chip, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Shield, Security, ArrowForward, Login, PersonAdd,
  CheckCircle, Warning, Error as ErrorIcon, Radar, Search
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [riskValue, setRiskValue] = useState(45);

  // Heuristics threat list based on risk value
  const getRiskStatus = (val) => {
    if (val <= 30) return { label: 'Safe / Low Risk', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' };
    if (val <= 70) return { label: 'Suspicious / Moderate', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
    return { label: 'Critical Threat / High Risk', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
  };

  const getThreatsForValue = (val) => {
    const threats = [
      { text: 'Legitimate sender domain match', min: 0, max: 100, ok: true },
      { text: 'Standard HTTPS encryption present', min: 0, max: 100, ok: true },
      { text: 'Email contains urgent wording ("ACT NOW")', min: 31, max: 100, ok: false },
      { text: 'Unknown sender (no SPF/DKIM record)', min: 45, max: 100, ok: false },
      { text: 'Insecure HTTP link found in body', min: 60, max: 100, ok: false },
      { text: 'IP address used instead of domain link', min: 75, max: 100, ok: false },
      { text: 'Spoofed brand domain name detected', min: 85, max: 100, ok: false }
    ];
    return threats.filter(t => val >= t.min);
  };

  const status = getRiskStatus(riskValue);
  const activeThreats = getThreatsForValue(riskValue);

  // Background style
  const bgSx = {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 30% 20%, rgba(26,69,53,0.4) 0%, transparent 60%), radial-gradient(ellipse at 75% 60%, rgba(42,122,85,0.15) 0%, transparent 50%), #080e09',
    color: '#f1f5f9',
    fontFamily: "'Inter', sans-serif"
  };

  return (
    <Box sx={bgSx}>
      {/* ── Navbar ── */}
      <Box sx={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,14,9,0.85)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', height: 72, alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, #14332a 0%, #2a7a55 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(74,222,128,0.2)' }}>
                <Shield sx={{ color: '#4ade80', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  PhishGuard
                </Typography>
                <Typography sx={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>
                  SECURITY SUITE
                </Typography>
              </Box>
            </Box>

            {/* Menu Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
              {['Features', 'Risk Simulator', 'Mitigation'].map((item) => (
                <Typography
                  key={item}
                  onClick={() => {
                    const el = document.getElementById(item.toLowerCase().replace(' ', '-'));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 14, cursor: 'pointer', '&:hover': { color: '#4ade80' }, transition: 'color 0.2s' }}
                >
                  {item}
                </Typography>
              ))}
            </Box>

            {/* Auth Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <Button
                    variant="text"
                    onClick={() => navigate('/dashboard')}
                    sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 14, '&:hover': { color: '#4ade80' } }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                    sx={{
                      background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
                      boxShadow: '0 4px 14px rgba(185,28,28,0.3)',
                      fontWeight: 700, borderRadius: '8px', px: 2.5,
                      '&:hover': { background: 'linear-gradient(135deg, #991b1b 0%, #991b1b 100%)' }
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="text"
                    startIcon={<Login />}
                    onClick={() => navigate('/login')}
                    sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 14, '&:hover': { color: '#4ade80' } }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<PersonAdd />}
                    onClick={() => navigate('/register')}
                    sx={{
                      background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
                      boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                      fontWeight: 700, borderRadius: '8px', px: 2.5,
                      '&:hover': { background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)' }
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Hero Section ── */}
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 6, md: 8 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 6 }} className="anim-fade-up">
          <Chip
            label="Integrated Cybersecurity"
            sx={{
              background: 'rgba(74,222,128,0.06)', color: '#4ade80',
              border: '1px solid rgba(74,222,128,0.2)', fontWeight: 700,
              fontSize: 12, mb: 3, px: 1.5
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1.5px', color: '#fff', lineHeight: 1.1, mb: 3, fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.2rem' } }}>
            See the Bigger Picture.<br />
            <span style={{ background: 'linear-gradient(90deg, #4ade80 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Integrated Security
            </span><br />
            in One View.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: 15, sm: 17 }, lineHeight: 1.6, maxWidth: 650, mb: 4 }}>
            PhishGuard redefines digital risk management. Protect your identity, analyze threat headers, and detect credential spoofing automatically in our all-in-one analysis suite.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              sx={{
                background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
                boxShadow: '0 8px 24px rgba(22,163,74,0.4)',
                fontWeight: 700, py: 1.8, px: 4, borderRadius: '10px',
                fontSize: 15,
                '&:hover': { background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)' }
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                const el = document.getElementById('risk-simulator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)',
                fontWeight: 700, py: 1.8, px: 3.5, borderRadius: '10px',
                fontSize: 15,
                '&:hover': { borderColor: '#4ade80', background: 'rgba(74,222,128,0.05)' }
              }}
            >
              Analyze Risk Live
            </Button>
          </Box>
        </Box>

        {/* Center: Decorative AI Security Shield Visualizer - Expanded size & detail */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }} className="anim-fade-up">
          <Paper
            sx={{
              width: { xs: 320, sm: 460, md: 520 }, height: { xs: 320, sm: 460, md: 520 },
              borderRadius: '50%',
              background: 'rgba(10,18,12,0.5)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(74,222,128,0.15)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.9), inset 0 0 60px rgba(74,222,128,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'visible'
            }}
          >
            {/* Outer coordinate ring with pulse */}
            <Box
              sx={{
                position: 'absolute', width: '92%', height: '92%', borderRadius: '50%',
                border: '1px solid rgba(74,222,128,0.08)',
                animation: 'pulse-ring 6s ease-in-out infinite'
              }}
            />

            {/* Concentric rings */}
            <Box sx={{ position: 'absolute', width: '80%', height: '80%', borderRadius: '50%', border: '1px dashed rgba(74,222,128,0.1)' }} />
            <Box sx={{ position: 'absolute', width: '60%', height: '60%', borderRadius: '50%', border: '1px dashed rgba(74,222,128,0.15)' }} />
            <Box sx={{ position: 'absolute', width: '40%', height: '40%', borderRadius: '50%', border: '1px solid rgba(74,222,128,0.08)' }} />

            {/* Glowing core */}
            <Box
              sx={{
                position: 'absolute', width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)',
                filter: 'blur(15px)'
              }}
            />

            {/* Floating Security Markers (The "Theory" Visualized) */}
            <Box sx={{
              position: 'absolute', top: '20%', right: '18%', display: 'flex', alignItems: 'center', gap: 1,
              background: 'rgba(12,22,15,0.85)', px: 1.5, py: 0.8, borderRadius: '20px',
              border: '1px solid rgba(74,222,128,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              zIndex: 2, transform: 'scale(0.95)'
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80' }} />
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#4ade80', letterSpacing: 0.5 }}>SPF VERIFIED</Typography>
            </Box>

            <Box sx={{
              position: 'absolute', bottom: '22%', left: '12%', display: 'flex', alignItems: 'center', gap: 1,
              background: 'rgba(12,22,15,0.85)', px: 1.5, py: 0.8, borderRadius: '20px',
              border: '1px solid rgba(74,222,128,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              zIndex: 2, transform: 'scale(0.95)'
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80' }} />
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#4ade80', letterSpacing: 0.5 }}>DKIM SIGNED</Typography>
            </Box>

            <Box sx={{
              position: 'absolute', top: '24%', left: '14%', display: 'flex', alignItems: 'center', gap: 1,
              background: 'rgba(12,22,15,0.85)', px: 1.5, py: 0.8, borderRadius: '20px',
              border: '1px solid rgba(74,222,128,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              zIndex: 2, transform: 'scale(0.95)'
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80' }} />
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#4ade80', letterSpacing: 0.5 }}>DMARC OK</Typography>
            </Box>

            <Box sx={{
              position: 'absolute', bottom: '26%', right: '12%', display: 'flex', alignItems: 'center', gap: 1,
              background: 'rgba(12,22,15,0.85)', px: 1.5, py: 0.8, borderRadius: '20px',
              border: '1px solid rgba(74,222,128,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              zIndex: 2, transform: 'scale(0.95)'
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80' }} />
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#4ade80', letterSpacing: 0.5 }}>SSL ENCRYPTED</Typography>
            </Box>

            <Box sx={{
              position: 'absolute', top: '48%', left: '4%', display: 'flex', alignItems: 'center', gap: 1,
              background: 'rgba(30,12,12,0.85)', px: 1.5, py: 0.8, borderRadius: '20px',
              border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              zIndex: 2, transform: 'scale(0.95)'
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', animation: 'spin 1s linear infinite' }} />
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#ef4444', letterSpacing: 0.5 }}>SPOOF BLOCKED</Typography>
            </Box>

            {/* Floating Shield */}
            <Box sx={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: { xs: 80, sm: 110 }, height: { xs: 80, sm: 110 }, borderRadius: '24px',
                  background: 'linear-gradient(135deg, #14332a 0%, #2a7a55 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 16px 40px rgba(42,122,85,0.4)',
                  border: '1.5px solid rgba(74,222,128,0.4)',
                  animation: 'float 4s ease-in-out infinite',
                  '&:hover': {
                    animationPlayState: 'paused',
                    transform: 'scale(1.05)',
                    borderColor: '#4ade80',
                    boxShadow: '0 20px 48px rgba(74,222,128,0.5)'
                  },
                  transition: 'transform 0.3s, border-color 0.3s, box-shadow 0.3s'
                }}
              >
                <Shield sx={{ fontSize: { xs: 40, sm: 54 }, color: '#4ade80' }} />
              </Box>
              <Typography sx={{ mt: 3.5, fontWeight: 800, fontSize: { xs: 11, sm: 13 }, color: 'rgba(255,255,255,0.45)', letterSpacing: 2, textTransform: 'uppercase' }}>
                Shield Protected
              </Typography>
            </Box>

            {/* Scanning Radar line */}
            <Box
              sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: '50%',
                overflow: 'hidden',
                pointerEvents: 'none'
              }}
            >
              <Box
                sx={{
                  position: 'absolute', top: '50%', left: '50%', width: '50%', height: 2,
                  background: 'linear-gradient(to right, rgba(74,222,128,0.45) 0%, transparent 100%)',
                  transformOrigin: 'left center',
                  animation: 'radar-sweep 4s linear infinite'
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* ── Features Grid Section ── */}
      <Box id="features" sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,18,12,0.4)', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, mb: 1 }}>
              Intelligence Suite
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              AI-Powered Threat Features
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', mt: 1.5, maxWidth: 600, mx: 'auto' }}>
              Our platform continuously scans, matches, and analyses security markers to prevent fraud before it reaches you.
            </Typography>
          </Box>

          <Grid container spacing={3.5} alignItems="stretch">
            {[
              { title: 'Digital Risk Rating', icon: <Security sx={{ color: '#4ade80' }} />, desc: 'Real-time classification algorithms to score email and link security vectors.' },
              { title: 'Brand Protection', icon: <Shield sx={{ color: '#4ade80' }} />, desc: 'Stops domain spoofing spoofers from posing as trustworthy platforms like PayPal or Google.' },
              { title: 'Threat Intelligence', icon: <Radar sx={{ color: '#4ade80' }} />, desc: 'Dynamic indicators highlighting urgency, keyword patterns, and link shorteners.' },
              { title: 'Anti-Phishing software', icon: <Search sx={{ color: '#4ade80' }} />, desc: 'Secure sandbox inspections to verify headers (SPF, DKIM, DMARC) instantly.' }
            ].map((f, i) => (
              <Grid key={i} item xs={12} sm={6} md={3} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Paper
                  sx={{
                    p: 3.5,
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    width: '100%',
                    background: 'rgba(12,22,15,0.7)',
                    border: '1px solid rgba(74,222,128,0.08)',
                    borderRadius: '16px',
                    transition: 'border 0.2s, background 0.2s',
                    '&:hover': { borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(14,30,20,0.85)' }
                  }}
                >
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(74,222,128,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                    {f.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, lineHeight: 1.6, flexGrow: 1 }}>
                    {f.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Interactive Risk Simulator ── */}
      <Box id="risk-simulator" sx={{ py: { xs: 8, md: 12 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Left Column: Slider Controls */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, mb: 1 }}>
                Interactive Radar
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', mb: 2 }}>
                Digital Heuristics Risk Meter
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', mb: 4, lineHeight: 1.6 }}>
                Adjust the slider below to simulate threat flags and see the risk indicator update dynamically. This mimics our backend threat analyzer engine.
              </Typography>

              {/* Slider widget */}
              <Box sx={{ px: 2, py: 4, background: 'rgba(12,22,15,0.7)', borderRadius: '16px', border: '1px solid rgba(74,222,128,0.08)', mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                    Threat Score Heuristic:
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: 18, color: status.color }}>
                    {riskValue}%
                  </Typography>
                </Box>
                <Slider
                  value={riskValue}
                  onChange={(e, val) => setRiskValue(val)}
                  min={0} max={100}
                  sx={{
                    color: status.color, height: 8,
                    '& .MuiSlider-track': { border: 'none' },
                    '& .MuiSlider-thumb': {
                      height: 20, width: 20, backgroundColor: '#fff', border: `3px solid ${status.color}`,
                      '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': { boxShadow: `0px 0px 0px 8px ${status.color}33` }
                    },
                    '& .MuiSlider-rail': { opacity: 0.2, backgroundColor: '#bfdbfe' }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>LOW</Typography>
                  <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>SUSPICIOUS</Typography>
                  <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>CRITICAL</Typography>
                </Box>
              </Box>

              {/* Dynamic status card */}
              <Box sx={{ p: 2.5, borderRadius: '12px', background: status.bg, border: `1px solid ${status.border}`, display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
                {riskValue <= 30 ? <CheckCircle sx={{ color: status.color }} /> : riskValue <= 70 ? <Warning sx={{ color: status.color }} /> : <ErrorIcon sx={{ color: status.color }} />}
                <Box>
                  <Typography sx={{ fontWeight: 800, color: status.color, fontSize: 14 }}>
                    {status.label}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>
                    {riskValue <= 30 ? 'All indicators verify as authentic. Safe for delivery.' : riskValue <= 70 ? 'Minor phishing flags detected. User alert recommended.' : 'High probability of phishing attack. Quarantine initiated.'}
                  </Typography>
                </Box>
              </Box>

              {/* Dynamic simulator recommendation list */}
              <Box sx={{ p: 2.5, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }} className="anim-fade-up">
                <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#fff', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield sx={{ color: '#4ade80', fontSize: 18 }} /> Actionable Recommendations:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {riskValue <= 30 ? (
                    <>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                        🟢 <strong>Verify Out-of-Band</strong>: Confirm any financial or account changes over a trusted phone call.
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                        🟢 <strong>Check Domain Spelling</strong>: Ensure there are no typos disguised in the sender domain (e.g. support vs supp0rt).
                      </Typography>
                    </>
                  ) : riskValue <= 70 ? (
                    <>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                        🟡 <strong>Avoid Link Clicks</strong>: Open a separate tab and type the URL manually (e.g. chase.com) to access account.
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                        🟡 <strong>Ignore Pressure Tactics</strong>: Do not panic if the message states account suspension in 24 hours.
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontSize: 12, color: '#ef4444', fontWeight: 600, lineHeight: 1.4 }}>
                        🔴 <strong>Delete Immediately</strong>: Purge the email from your inbox to prevent any accidental clicks.
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#ef4444', fontWeight: 600, lineHeight: 1.4 }}>
                        🔴 <strong>Avoid All Attachments</strong>: Files may contain keyloggers or hidden background download scripts.
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Right Column: Dynamic Threat Scanner Grid */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4, background: 'rgba(10,18,12,0.92)',
                  border: '1.5px solid rgba(74,222,128,0.12)',
                  borderRadius: '20px',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.6)'
                }}
              >
                {/* Radar sweep visualization */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
                  <Box sx={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radar sx={{ color: status.color, animation: `spin ${Math.max(1, 6 - (riskValue / 20))}s linear infinite` }} />
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
                      Active Indicators Scanned
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                      Simulating real-time heuristics scanner
                    </Typography>
                  </Box>
                </Box>

                {/* Threat indicators checklist */}
                <Typography sx={{ fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase', mb: 2 }}>
                  Safety Check Verdicts
                </Typography>
                <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {activeThreats.map((threat, index) => (
                    <ListItem key={index} sx={{ p: 0 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {threat.ok ? (
                          <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                        ) : (
                          <Warning sx={{ color: '#ef4444', fontSize: 16 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={threat.text}
                        primaryTypographyProps={{
                          sx: { color: threat.ok ? 'rgba(255,255,255,0.65)' : '#ef4444', fontSize: 13, fontWeight: threat.ok ? 500 : 700 }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Mitigation Pipeline Chevron Steps ── */}
      <Box id="mitigation" sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,14,9,0.95)', py: 6, pb: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 850, color: '#fff' }}>
              Our Mitigation Pipeline Phases
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', mt: 1, fontSize: 13.5 }}>
              The end-to-end phases to identify, quarantine, and neutralize threats.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2.5 }}>
            {[
              { step: 'Identify', desc: 'Scan parameters' },
              { step: 'Detect', desc: 'Isolate vectors' },
              { step: 'Prevent', desc: 'Nullify payload' },
              { step: 'Recover', desc: 'Restore status' }
            ].map((p, index) => (
              <Paper
                key={index}
                sx={{
                  background: 'linear-gradient(135deg, #10241b 0%, #14332a 100%)',
                  border: '1px solid rgba(74,222,128,0.15)',
                  py: 2.5, px: 4, width: 220, textAlign: 'center',
                  borderRadius: '12px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  position: 'relative'
                }}
              >
                <Typography sx={{ color: '#4ade80', fontWeight: 900, fontSize: 15 }}>
                  {p.step}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5, mt: 0.5 }}>
                  {p.desc}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ py: 4, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', background: '#080e09' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          © 2026 PhishGuard Security Platform. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
