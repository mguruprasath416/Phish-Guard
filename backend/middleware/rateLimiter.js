const rateLimit = require('express-rate-limit');

// ── General Rate Limiter ───────────────────────────────────────────────────────

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Auth Rate Limiter (stricter for login/register) ───────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Scan Rate Limiter (moderate for scanning) ─────────────────────────────────

const scanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each user to 50 scans per hour
  message: {
    success: false,
    error: 'Scan limit reached. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  },
});

// ── API Rate Limiter (for external API calls) ────────────────────────────────

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 API requests per minute
  message: {
    success: false,
    error: 'API rate limit exceeded. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  scanLimiter,
  apiLimiter
};
