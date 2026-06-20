// Application constants

module.exports = {
  // Threat levels
  THREAT_LEVELS: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  },

  // Threat level thresholds
  THRESHOLDS: {
    CRITICAL: 80,
    HIGH: 60,
    MEDIUM: 40,
    LOW: 0,
  },

  // Scan types
  SCAN_TYPES: {
    EMAIL: 'email',
    URL: 'url',
  },

  // Scan status
  SCAN_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },

  // User roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // Authentication providers
  AUTH_PROVIDERS: {
    LOCAL: 'local',
    GOOGLE: 'google',
  },

  // Rate limiting
  RATE_LIMITS: {
    GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
    AUTH: { windowMs: 15 * 60 * 1000, max: 5 },
    SCAN: { windowMs: 60 * 60 * 1000, max: 50 },
    API: { windowMs: 60 * 1000, max: 30 },
  },

  // Confidence levels
  CONFIDENCE_LEVELS: {
    VERY_HIGH: 0.9,
    HIGH: 0.75,
    MEDIUM: 0.6,
    LOW: 0.4,
  },

  // Email validation patterns
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    PHONE: /^\+?[\d\s-()]+$/,
  },

  // Error messages
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already exists',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  },

  // Success messages
  SUCCESS_MESSAGES: {
    REGISTER_SUCCESS: 'Registration successful',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    EMAIL_VERIFIED: 'Email verified successfully',
    SCAN_COMPLETE: 'Scan completed successfully',
  },

  // File size limits (in bytes)
  FILE_LIMITS: {
    MAX_ATTACHMENT_SIZE: 25 * 1024 * 1024, // 25MB
    MAX_EMAIL_SIZE: 50 * 1024 * 1024, // 50MB
  },

  // Cache durations (in seconds)
  CACHE_DURATIONS: {
    SCAN_RESULT: 900, // 15 minutes
    THREAT_INTEL: 900, // 15 minutes
    USER_DATA: 3600, // 1 hour
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_SKIP: 0,
  },
};
