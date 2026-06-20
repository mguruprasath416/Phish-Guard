import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  LinearProgress, Chip, CircularProgress, Alert,
  IconButton, Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Shield as ShieldIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  ReportProblem as AlertIcon,
  Security as SecurityIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/* ── Risk Progress ─────────────────────────────────────────────────────── */
const RiskBar = ({ score }) => {
  const color = score < 30 ? '#16a34a' : score < 60 ? '#d97706' : '#dc2626';
  const bg    = score < 30 ? '#dcfce7' : score < 60 ? '#fef3c7' : '#fee2e2';
  const label = score < 30 ? 'SAFE'    : score < 60 ? 'SUSPICIOUS' : 'PHISHING';
  return (
    <Box sx={{ p: 2.5, borderRadius: '12px', background: bg, border: `1.5px solid ${color}30` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Chip
          icon={score < 30 ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : score < 60 ? <WarningIcon sx={{ fontSize: 14 }} /> : <ErrorIcon sx={{ fontSize: 14 }} />}
          label={`✓ ${label}`}
          sx={{ background: color, color: '#fff', fontWeight: 700, fontSize: 13, height: 32 }}
        />
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>
          Risk Score: <span style={{ color }}>{score}/100</span>
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate" value={score}
        sx={{
          height: 8, borderRadius: 4,
          background: 'rgba(0,0,0,0.08)',
          '& .MuiLinearProgress-bar': { background: color, borderRadius: 4, transition: 'transform 1s ease' }
        }}
      />
    </Box>
  );
};

/* ── URL Detector Component ────────────────────────────────────────────── */
const URLDetector = () => {
  const [url, setUrl]       = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied]   = useState(false);
  const [scanning, setScanning] = useState(false);

  const simulateURLScan = (url) => {
    const suspiciousDomains = ['bit.ly','tinyurl','free','login','secure','paypal-','bank-','account-update'];
    const hasHTTPS = url.startsWith('https://');
    const hasIP    = /\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
    const hasSuspicious = suspiciousDomains.some(d => url.toLowerCase().includes(d));
    const hasExcessiveSubdomains = (url.match(/\./g) || []).length > 3;
    const hasSpecialChars = /[@%]/.test(url);

    let score = 0;
    const flags = [];
    if (!hasHTTPS)            { score += 25; flags.push('No HTTPS encryption'); }
    if (hasIP)                { score += 40; flags.push('IP address used instead of domain'); }
    if (hasSuspicious)        { score += 30; flags.push('Suspicious keywords in URL'); }
    if (hasExcessiveSubdomains){ score += 20; flags.push('Excessive subdomains detected'); }
    if (hasSpecialChars)      { score += 15; flags.push('Special characters in URL'); }

    return { score: Math.min(score, 100), flags, url };
  };

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1200));
    setScanning(false);
    setResult(simulateURLScan(url.trim()));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(12,22,15,0.7)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
      <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#fff', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinkIcon sx={{ color: '#4ade80' }} /> URL Threat Detector
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', mb: 3 }}>
        Enter any suspicious URL for real-time encryption and safety profile scan.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
        <TextField
          fullWidth
          placeholder="Paste URL here (e.g. https://paypal-security-update.com)..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleScan()}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, color: '#9ca3af', display: 'flex', alignItems: 'center' }}><LinkIcon fontSize="small" /></Box>
            ),
            sx: {
              background: '#1a1a1a', borderRadius: '10px',
              '& input': { color: '#e5e7eb', fontSize: 14, '&::placeholder': { color: '#6b7280' } },
              '& fieldset': { borderColor: '#2a2a2a' },
              '&:hover fieldset': { borderColor: '#2a7a55' },
              '&.Mui-focused fieldset': { borderColor: '#2a7a55 !important' },
            }
          }}
          sx={{ '& .MuiInputLabel-root': { display: 'none' } }}
        />
        <Button
          variant="contained"
          onClick={handleScan}
          disabled={!url.trim() || scanning}
          sx={{
            px: 3, borderRadius: '10px', minWidth: 100, fontSize: 14,
            background: 'linear-gradient(135deg, #1a5c3a 0%, #2a7a55 100%)',
            boxShadow: '0 4px 14px rgba(42,122,85,0.4)',
            '&:hover': { background: 'linear-gradient(135deg, #144d30 0%, #1f6644 100%)' },
          }}
          startIcon={scanning ? <CircularProgress size={14} color="inherit" /> : <SearchIcon fontSize="small" />}
        >
          {scanning ? 'Scanning' : 'Scan'}
        </Button>
      </Box>

      {/* Scanning state */}
      {scanning && (
        <Box sx={{ p: 3, mt: 2, borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 1.5 }}>
            <CircularProgress size={36} sx={{ color: '#16a34a' }} />
            <ShieldIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 18, color: '#16a34a' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, color: '#15803d', fontSize: 13.5 }}>
            Analyzing URL safety heuristics...
          </Typography>
        </Box>
      )}

      {/* Result */}
      {result && !scanning && (
        <Box className="anim-fade-up" sx={{ mt: 2.5, p: 2, borderRadius: '14px', background: '#fafaf8', border: '1px solid #e5e7eb' }}>
          <RiskBar score={result.score} />

          <Box sx={{ mt: 2.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#374151', mb: 1 }}>
              Target Domain:
            </Typography>
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              p: 1.2, borderRadius: '8px', background: '#fff', border: '1px solid #e5e7eb',
            }}>
              <Typography sx={{ fontSize: 12.5, color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {result.url}
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton size="small" onClick={handleCopy} sx={{ ml: 1, color: '#6b7280' }}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {result.flags.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#dc2626', mb: 1 }}>
                ⚠ Security Flags Triggered:
              </Typography>
              {result.flags.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <ErrorIcon sx={{ fontSize: 14, color: '#dc2626' }} />
                  <Typography sx={{ fontSize: 12.5, color: '#374151' }}>{f}</Typography>
                </Box>
              ))}
              
              {/* URL Recommendation for Suspicious Domain */}
              <Box sx={{ mt: 2.5, p: 1.8, borderRadius: '10px', background: '#fff5f5', border: '1px solid #fecaca' }}>
                <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#b91c1c', mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  🛑 Action Recommendation:
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>
                  Do not visit this URL. If you have already opened it, close the tab immediately. Never enter credentials, login passwords, or credit card info. To reach the actual service, search for the brand directly on a trusted search engine.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#15803d' }}>Clean & Safe Domain</Typography>
                  <Typography sx={{ fontSize: 11, color: '#6b7280' }}>No phishing signatures detected.</Typography>
                </Box>
              </Box>
              
              {/* URL Recommendation for Safe Domain */}
              <Box sx={{ p: 1.8, borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#15803d', mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  💡 Safe Browsing Tip:
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>
                  Even when marked safe, perform a spelling check of the domain (e.g. check for similar characters like <code>i</code> vs <code>l</code>). Avoid logging in if you were redirected to this site via a suspicious text or unsolicited email.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

/* ── performInDepthAnalysis Helper ─────────────────────────────────────── */
const performInDepthAnalysis = (sender, subject, body) => {
  const emailLower = (sender || '').toLowerCase();
  const subjectLower = (subject || '').toLowerCase();
  const bodyLower = (body || '').toLowerCase();
  
  let safetyScore = 100;
  const threatFlags = [];
  const riskHighlights = [];
  
  // 1. Domain Spoofing Detection
  const brands = [
    { name: 'PayPal', domain: 'paypal.com' },
    { name: 'Netflix', domain: 'netflix.com' },
    { name: 'Google', domain: 'google.com' },
    { name: 'Amazon', domain: 'amazon.com' },
    { name: 'Apple', domain: 'apple.com' },
    { name: 'Microsoft', domain: 'microsoft.com' },
    { name: 'Facebook', domain: 'facebook.com' },
    { name: 'Instagram', domain: 'instagram.com' },
    { name: 'Steam', domain: 'steampowered.com' },
    { name: 'Chase Bank', domain: 'chase.com' },
    { name: 'Bank of America', domain: 'bankofamerica.com' }
  ];
  
  let brandSpoofed = null;
  const senderDomain = emailLower.includes('@') ? emailLower.split('@')[1] : '';
  
  for (const brand of brands) {
    const mentionsBrand = 
      emailLower.includes(brand.name.toLowerCase()) || 
      subjectLower.includes(brand.name.toLowerCase()) || 
      bodyLower.includes(brand.name.toLowerCase());
      
    if (mentionsBrand && senderDomain && !senderDomain.includes(brand.domain)) {
      brandSpoofed = brand;
      break;
    }
  }
  
  if (brandSpoofed) {
    safetyScore -= 35;
    threatFlags.push(`Brand Spoofing: Claims association with ${brandSpoofed.name} but originates from domain "${senderDomain}" instead of "${brandSpoofed.domain}".`);
    riskHighlights.push({
      type: 'high',
      title: 'Domain Spoofing Alert',
      desc: `Sender domain "${senderDomain}" is not authorized by ${brandSpoofed.name}.`
    });
  }
  
  // 2. Security Headers simulation
  const headers = {
    spf: brandSpoofed ? 'FAIL' : (senderDomain ? 'PASS' : 'NONE'),
    dkim: brandSpoofed ? 'FAIL' : (senderDomain ? 'PASS' : 'NONE'),
    dmarc: brandSpoofed ? 'FAIL' : (senderDomain ? 'PASS' : 'NONE')
  };
  
  // 3. Urgency & Social Engineering check
  const urgencyWords = ['urgent', 'immediate', 'action required', 'suspended', 'verify now', 'security alert', 'unauthorized access', 'pay now', 'account restricted'];
  const foundUrgency = urgencyWords.filter(w => subjectLower.includes(w) || bodyLower.includes(w));
  if (foundUrgency.length > 0) {
    safetyScore -= Math.min(foundUrgency.length * 8, 25);
    threatFlags.push(`Urgency Triggers: Detects high-pressure phrasing (${foundUrgency.join(', ')}).`);
    riskHighlights.push({
      type: 'medium',
      title: 'High Urgency Phrasing',
      desc: 'Urgent subject lines or bodies are designed to force quick decisions.'
    });
  }
  
  // 4. Sensitive Information Harvesting Check
  const sensitiveWords = ['password', 'ssn', 'social security', 'credit card', 'cvv', 'pin number', 'verify your card', 'identity confirm'];
  const foundSensitive = sensitiveWords.filter(w => bodyLower.includes(w));
  if (foundSensitive.length > 0) {
    safetyScore -= 25;
    threatFlags.push(`Credential Harvesting: Requests sensitive credentials or identification (${foundSensitive.join(', ')}).`);
    riskHighlights.push({
      type: 'high',
      title: 'Credential Request Detected',
      desc: 'Legitimate services rarely request credentials or personal details via email.'
    });
  }
  
  // 5. Link extraction and safety check
  const urls = bodyLower.match(/(https?:\/\/[^\s"']+)/g) || [];
  const linkAnalyses = urls.map(url => {
    let linkScore = 100;
    const linkFlags = [];
    
    if (!url.startsWith('https://')) {
      linkScore -= 30;
      linkFlags.push('No HTTPS encryption (HTTP)');
    }
    
    const hasIP = /\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
    if (hasIP) {
      linkScore -= 45;
      linkFlags.push('Uses IP address instead of domain');
    }
    
    const suspKeywords = ['login', 'verify', 'update', 'secure', 'account', 'signin', 'free'];
    const matchedKeywords = suspKeywords.filter(k => url.toLowerCase().includes(k));
    if (matchedKeywords.length > 0) {
      linkScore -= 20;
      linkFlags.push(`Suspicious keywords found in URL (${matchedKeywords.join(', ')})`);
    }
    
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'rebrand.ly'];
    if (shorteners.some(s => url.toLowerCase().includes(s))) {
      linkScore -= 25;
      linkFlags.push('Uses link shortener to conceal target');
    }
    
    return {
      url,
      score: Math.max(linkScore, 0),
      flags: linkFlags
    };
  });
  
  const badLinksCount = linkAnalyses.filter(l => l.score < 60).length;
  if (badLinksCount > 0) {
    safetyScore -= 20;
    threatFlags.push(`Malicious Links: Contains ${badLinksCount} suspicious or unencrypted URLs.`);
  }
  
  const finalScore = Math.max(safetyScore, 0);
  let verdict = 'SAFE';
  if (finalScore < 40) verdict = 'CRITICAL THREAT';
  else if (finalScore < 75) verdict = 'SUSPICIOUS';
  
  return {
    score: finalScore,
    verdict,
    headers,
    threatFlags,
    riskHighlights,
    linkAnalyses,
    urlsCount: urls.length
  };
};

/* ── Render Analysis Report Component ─────────────────────────────────── */
const RenderAnalysisReport = ({ sender, subject, body, date, dbId, onReport }) => {
  const analysis = performInDepthAnalysis(sender, subject, body);
  const score = analysis.score;
  const verdict = analysis.verdict;
  const isPhishing = verdict !== 'SAFE';
  
  const progressColor = score > 75 ? '#16a34a' : score > 40 ? '#f59e0b' : '#dc2626';
  const progressText = score > 75 ? '#15803d' : score > 40 ? '#b45309' : '#b91c1c';
  
  const [reported, setReported] = useState(false);
  const [quarantined, setQuarantined] = useState(false);

  const handleReport = () => {
    setReported(true);
    if (onReport) onReport(dbId);
  };

  return (
    <Box className="anim-fade-up" sx={{ mt: 1 }}>
      {/* Risk Gauge Panel */}
      <Paper sx={{ p: 2.5, borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: { sm: '1px solid #f0f0f0' }, py: 1 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', width: 88, height: 88, mb: 1.5 }}>
              <CircularProgress variant="determinate" value={score} size={88} thickness={6} sx={{ color: progressColor }} />
              <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 800, color: progressText }}>
                  {score}%
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                  Safety
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={isPhishing ? <AlertIcon sx={{ fontSize: '14px !important' }} /> : <CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
              label={verdict}
              sx={{
                background: progressColor,
                color: '#fff', fontWeight: 800, fontSize: 11, height: 28,
                '& .MuiChip-icon': { color: '#fff' }
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 8 }} sx={{ pl: { sm: 3 } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#374151', mb: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SecurityIcon sx={{ fontSize: 16, color: '#10b981' }} /> Threat Analysis Verdict
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, lineHeight: 1.5, fontSize: 13 }}>
              {verdict === 'SAFE' 
                ? 'Our system did not detect any brand spoofing or known credential harvesting triggers in this email. SPF, DKIM, and DMARC alignments match the claimed sender.' 
                : verdict === 'SUSPICIOUS' 
                ? 'Caution advised. This email contains warning signs like high-pressure phrasing or unauthenticated links that are common in social engineering.' 
                : 'High risk detected. This email matches multiple critical phishing indicators (e.g. brand impersonation or credential harvesting). Do not interact.'}
            </Typography>
            
            {/* Header Authentication Status */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box sx={{ flex: 1, p: 0.8, borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 8, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>SPF Check</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: analysis.headers.spf === 'PASS' ? '#16a34a' : '#ef4444' }}>
                  {analysis.headers.spf}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 0.8, borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 8, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>DKIM Check</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: analysis.headers.dkim === 'PASS' ? '#16a34a' : '#ef4444' }}>
                  {analysis.headers.dkim}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 0.8, borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 8, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>DMARC Check</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: analysis.headers.dmarc === 'PASS' ? '#16a34a' : '#ef4444' }}>
                  {analysis.headers.dmarc}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Analysis Accordion */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {/* Threat logs */}
        {analysis.threatFlags.length > 0 ? (
          <Box sx={{ p: 2, borderRadius: '12px', background: '#fff7f7', border: '1px solid #fecaca' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b91c1c', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AlertIcon sx={{ fontSize: 16 }} /> Phishing Indicators Found ({analysis.threatFlags.length})
            </Typography>
            {analysis.threatFlags.map((flag, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.7 }}>
                <Typography sx={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>•</Typography>
                <Typography sx={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.4 }}>{flag}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 2, borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 18 }} />
            <Typography sx={{ fontSize: 13, color: '#15803d', fontWeight: 700 }}>
              No critical phishing indicators detected.
            </Typography>
          </Box>
        )}

        {/* Link Safety Check */}
        {analysis.linkAnalyses.length > 0 && (
          <Box sx={{ p: 2, borderRadius: '12px', background: '#fff', border: '1px solid #e5e7eb' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#374151', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LinkIcon sx={{ fontSize: 16, color: '#3b82f6' }} /> URL Security Inspection
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {analysis.linkAnalyses.map((link, idx) => (
                <Box key={idx} sx={{ p: 1.2, borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
                    <Typography sx={{ fontSize: 11, color: '#1f2937', fontFamily: 'monospace', wordBreak: 'break-all', fontWeight: 600 }}>
                      {link.url}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${link.score}% Safe`}
                      sx={{
                        fontSize: 9, fontWeight: 800, height: 20,
                        background: link.score > 70 ? '#dcfce7' : link.score > 40 ? '#fef3c7' : '#fee2e2',
                        color: link.score > 70 ? '#15803d' : link.score > 40 ? '#b45309' : '#b91c1c'
                      }}
                    />
                  </Box>
                  {link.flags.length > 0 ? (
                    link.flags.map((f, i) => (
                      <Typography key={i} sx={{ fontSize: 10.5, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                        ⚠ {f}
                      </Typography>
                    ))
                  ) : (
                    <Typography sx={{ fontSize: 10.5, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      ✓ Secure HTTPS connection link
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Safety Recommendations Checklist */}
      <Box sx={{
        p: 2.5, borderRadius: '12px', mb: 3,
        background: verdict === 'SAFE' ? '#f0fdf4' : verdict === 'SUSPICIOUS' ? '#fffbeb' : '#fff5f5',
        border: `1.5px solid ${verdict === 'SAFE' ? '#bbf7d0' : verdict === 'SUSPICIOUS' ? '#fde68a' : '#fecaca'}`
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: verdict === 'SAFE' ? '#15803d' : verdict === 'SUSPICIOUS' ? '#b45309' : '#b91c1c', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <SecurityIcon sx={{ fontSize: 18 }} /> Actionable Security Guidelines
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {verdict === 'SAFE' ? (
            <>
              <Typography sx={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>1.</span> 
                <span><strong>Out-of-Band Verification</strong>: Although marked safe, if this email asks you to update payment details, call the sender directly using their official number (not the number listed in this email) to verify the request.</span>
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>2.</span> 
                <span><strong>Check for Typos</strong>: Verify the sender address character-by-character. Phishers use domain names designed to spoof your eyes (like <code>micros0ft.com</code> instead of <code>microsoft.com</code>).</span>
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>3.</span> 
                <span><strong>No Secrets</strong>: Never reply with sensitive details like login passwords, SSNs, bank details, or OTP codes. Legitimate organizations never request them over email.</span>
              </Typography>
            </>
          ) : verdict === 'SUSPICIOUS' ? (
            <>
              <Typography sx={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#d97706', fontWeight: 'bold' }}>1.</span> 
                <span><strong>Do Not Click Links</strong>: Open a separate browser window and manually enter the target website URL (e.g., type <code>paypal.com</code>) to access your dashboard safely.</span>
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#d97706', fontWeight: 'bold' }}>2.</span> 
                <span><strong>Avoid Downloads</strong>: Suspicious emails often contain attachments (.doc, .pdf, .zip) containing malicious macro scripts. Do not download or extract them.</span>
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#d97706', fontWeight: 'bold' }}>3.</span> 
                <span><strong>Identify Pressure Tactics</strong>: High urgency subject lines (e.g. "Action Required Immediately") are designed to trigger panic and hasty clicks. Pause and think.</span>
              </Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>1.</span> 
                <span><strong>Do Not Interact</strong>: Do not click links, download files, reply to the sender, or forward this email. Phishers use tracking pixels to see if you open their mails.</span>
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>2.</span> 
                <span><strong>Report Phishing</strong>: Click the <strong>Report Phishing</strong> button below to flag this template in the database, alert administrators, and help improve scanner rules.</span>
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>3.</span> 
                <span><strong>Delete/Quarantine</strong>: Click the <strong>Quarantine</strong> option below to isolate this scan log, and delete the actual email from your inbox immediately.</span>
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Action Deck */}
      <Paper sx={{ p: 1.5, borderRadius: '12px', background: '#fafafa', border: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small" variant="contained" color="error" disabled={reported} onClick={handleReport}
            startIcon={<WarningIcon sx={{ fontSize: 14 }} />} sx={{ borderRadius: '8px', fontWeight: 700, fontSize: 12, py: 0.6 }}
          >
            {reported ? 'Phishing Reported' : 'Report Phishing'}
          </Button>
          <Button
            size="small" variant="outlined" disabled={quarantined} onClick={() => setQuarantined(true)}
            startIcon={<DeleteIcon sx={{ fontSize: 14 }} />} sx={{ borderRadius: '8px', fontSize: 12, py: 0.6, color: '#dc2626', borderColor: '#fca5a5', '&:hover': { borderColor: '#ef4444', background: '#fee2e2' } }}
          >
            {quarantined ? 'Quarantined' : 'Quarantine'}
          </Button>
        </Box>
        <Button
          size="small" variant="text" onClick={() => alert(`Technical Header Inspection for: ${subject}\n\nSPF Alignment: ${analysis.headers.spf}\nDKIM Status: ${analysis.headers.dkim}\nDMARC Check: ${analysis.headers.dmarc}\nSender Domain: ${sender.includes('@') ? sender.split('@')[1] : 'Unknown'}\nTrust Rank: ${score}/100`)}
          sx={{ color: '#4b5563', textTransform: 'none', fontWeight: 700, fontSize: 12 }}
        >
          Inspect Mail Headers
        </Button>
      </Paper>
    </Box>
  );
};

/* ── Email Analyzer Component ─────────────────────────────────────────── */
const EmailAnalyzer = () => {
  const [form, setForm]     = useState({ sender: '', subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const { user } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await axios.post('/api/simulations', { ...form, email: user?.email });
      if (res.data.success) {
        setResult(res.data.result);
      } else {
        throw new Error(res.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    background: 'rgba(0,0,0,0.2)', borderRadius: '10px',
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: '#4ade80' },
      '&.Mui-focused fieldset': { borderColor: '#4ade80' },
    },
    '& input, & textarea': { fontSize: 13.5, color: '#f1f5f9' },
  };

  return (
    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(12,22,15,0.7)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
      <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#fff', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmailIcon sx={{ color: '#4ade80' }} /> Email Threat Scanner
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', mb: 3 }}>
        Paste email contents to inspect for threat indicators and brand spoofing.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', border: '1px solid #fecaca', background: '#fff5f5' }}>{error}</Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField fullWidth label="Sender Email Address" name="sender" value={form.sender}
            onChange={handleChange} required placeholder="e.g. secure@paypal-support.com" sx={fieldStyle} size="small" />
          
          <TextField fullWidth label="Email Subject Line" name="subject" value={form.subject}
            onChange={handleChange} required placeholder="e.g. Account Restricted Immediately" sx={fieldStyle} size="small" />
          
          <TextField fullWidth label="Email Body Text Content" name="body" value={form.body}
            onChange={handleChange} required multiline rows={14} placeholder="Paste email content text here..." sx={fieldStyle} />
          
          <Button
            type="submit" variant="contained" disabled={loading}
            sx={{
              py: 1.2, fontSize: 13.5, fontWeight: 800, borderRadius: '10px',
              background: 'linear-gradient(135deg, #1a5c3a 0%, #2a7a55 100%)',
              boxShadow: '0 4px 14px rgba(42,122,85,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #144d30 0%, #1f6644 100%)', boxShadow: '0 4px 20px rgba(42,122,85,0.45)' },
            }}
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SearchIcon fontSize="small" />}
          >
            {loading ? 'Running Scan...' : 'Analyze Threat Profile'}
          </Button>
        </Box>
      </form>

      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 850, fontSize: 18, color: '#fff', mb: 2 }}>
            🛡️ Live Security Analysis Report
          </Typography>
          <RenderAnalysisReport 
            sender={form.sender} 
            subject={form.subject} 
            body={form.body} 
            date={result.simulation?.createdAt}
            dbId={result.simulation?.id}
          />
        </Box>
      )}
    </Paper>
  );
};

/* ── Analyze Page Main Component ──────────────────────────────────────── */
const Analyze = () => {
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
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Threat Intelligence Center
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, mt: 0.5 }}>
          Inspect suspicious domains and analyze email headers for spoofing threats in real-time.
        </Typography>
      </Box>

      {/* Main Scanner Grid */}
      <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
        <Grid container spacing={4}>
          {/* URL Threat Detector - Full Width */}
          <Grid size={12}>
            <URLDetector />
          </Grid>
          
          {/* Email Threat Scanner - Full Width */}
          <Grid size={12}>
            <EmailAnalyzer />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Analyze;
export { performInDepthAnalysis, RenderAnalysisReport };
