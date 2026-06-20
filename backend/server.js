const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Hardcoded allowed origins (always works regardless of env vars)
const HARDCODED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://phish-guard-three-iota.vercel.app',  // ← production Vercel URL
];

// Also read from env (strip trailing slashes, support comma-separated)
const ENV_ORIGINS = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const ALLOWED_ORIGINS = [...new Set([...HARDCODED_ORIGINS, ...ENV_ORIGINS])];

// ── Layer 1: Manually inject CORS headers FIRST (catches all edge cases) ──────
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed =
    !origin ||
    ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/phish-guard.*\.vercel\.app$/.test(origin);

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Vary', 'Origin');
  }

  // Immediately respond to OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// ── Layer 2: cors() package as a second layer ─────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const allowed =
      !origin ||
      ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/phish-guard.*\.vercel\.app$/.test(origin);
    // callback(null, false) instead of callback(new Error) — always sends headers
    callback(null, allowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Database Connection ───────────────────────────────────────────────────────

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ─── Routes ───────────────────────────────────────────────────────────────────

const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/reports', reportRoutes);

// Email analysis routes (existing functionality)
const Email = require('./models/Email');
const User = require('./models/User');
const { protect } = require('./middleware/authMiddleware');

// Create Phishing Simulation
app.post('/api/simulations', protect, async (req, res) => {
  try {
    const { sender, subject, body } = req.body;

    if (!sender || !subject || !body) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const { isPhishing, indicators } = analyzePhishingIndicators(sender, subject, body);

    const simulation = new Email({
      sender, subject, body, isPhishing, indicators, createdBy: req.user._id
    });

    await simulation.save();

    res.status(201).json({
      success: true,
      result: {
        isPhishing,
        indicators,
        simulation: { id: simulation._id, sender, subject, createdAt: simulation.createdAt }
      }
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ success: false, error: 'Error analyzing email' });
  }
});

// Get All Simulations
app.get('/api/simulations', protect, async (req, res) => {
  try {
    const simulations = await Email.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(simulations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching simulations' });
  }
});

// Analyze Email (no auth required)
app.post('/api/analyze', async (req, res) => {
  try {
    const { sender, subject, body } = req.body;
    const { isPhishing, indicators } = analyzePhishingIndicators(sender, subject, body);

    res.json({
      isPhishing,
      indicators,
      analysis: {
        sender: analyzeSender(sender),
        subject: analyzeSubject(subject),
        body: analyzeBody(body)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Helper Functions ──────────────────────────────────────────────────────────

function analyzePhishingIndicators(sender, subject, body) {
  const emailLower = (sender || '').toLowerCase();
  const subjectLower = (subject || '').toLowerCase();
  const bodyLower = (body || '').toLowerCase();
  
  let safetyScore = 100;
  const threatFlags = [];
  
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
  }
  
  // 2. Urgency & Social Engineering check
  const urgencyWords = ['urgent', 'immediate', 'action required', 'suspended', 'verify now', 'security alert', 'unauthorized access', 'pay now', 'account restricted'];
  const foundUrgency = urgencyWords.filter(w => subjectLower.includes(w) || bodyLower.includes(w));
  if (foundUrgency.length > 0) {
    safetyScore -= Math.min(foundUrgency.length * 8, 25);
    threatFlags.push(`Urgency Triggers: Detects high-pressure phrasing (${foundUrgency.join(', ')}).`);
  }
  
  // 3. Sensitive Information Harvesting Check
  const sensitiveWords = ['password', 'ssn', 'social security', 'credit card', 'cvv', 'pin number', 'verify your card', 'identity confirm'];
  const foundSensitive = sensitiveWords.filter(w => bodyLower.includes(w));
  if (foundSensitive.length > 0) {
    safetyScore -= 25;
    threatFlags.push(`Credential Harvesting: Requests sensitive credentials or identification (${foundSensitive.join(', ')}).`);
  }
  
  // 4. Link extraction and safety check
  const urls = bodyLower.match(/(https?:\/\/[^\s"']+)/g) || [];
  const linkAnalyses = urls.map(url => {
    let linkScore = 100;
    const linkFlags = [];
    
    if (!url.startsWith('https://')) {
      linkScore -= 30;
    }
    
    const hasIP = /\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
    if (hasIP) {
      linkScore -= 45;
    }
    
    const suspKeywords = ['login', 'verify', 'update', 'secure', 'account', 'signin', 'free'];
    const matchedKeywords = suspKeywords.filter(k => url.toLowerCase().includes(k));
    if (matchedKeywords.length > 0) {
      linkScore -= 20;
    }
    
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'rebrand.ly'];
    if (shorteners.some(s => url.toLowerCase().includes(s))) {
      linkScore -= 25;
    }
    
    return {
      score: Math.max(linkScore, 0),
    };
  });
  
  const badLinksCount = linkAnalyses.filter(l => l.score < 60).length;
  if (badLinksCount > 0) {
    safetyScore -= 20;
    threatFlags.push(`Malicious Links: Contains ${badLinksCount} suspicious or unencrypted URLs.`);
  }
  
  const finalScore = Math.max(safetyScore, 0);
  const isPhishing = finalScore < 75;
  
  return {
    isPhishing,
    indicators: threatFlags,
    score: finalScore
  };
}

function analyzeSender(sender) {
  return { suspicious: false, reason: 'Sender analysis not implemented' };
}

function analyzeSubject(subject) {
  const subjectLower = subject.toLowerCase();
  const urgencyWords = ['urgent', 'immediate', 'action required', 'important'];
  const hasUrgency = urgencyWords.some(w => subjectLower.includes(w));
  return { suspicious: hasUrgency, reason: hasUrgency ? 'Contains urgency indicators' : 'No urgency detected' };
}

function analyzeBody(body) {
  const bodyLower = body.toLowerCase();
  const suspiciousPatterns = [
    'verify your account', 'confirm your identity', 'update your information',
    'click here', 'login to continue'
  ];
  const matches = suspiciousPatterns.filter(p => bodyLower.includes(p));
  return {
    suspicious: matches.length > 0,
    matches,
    reason: matches.length > 0 ? 'Contains suspicious patterns' : 'No suspicious patterns detected'
  };
}

// ─── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
