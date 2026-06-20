// Helper utility functions

const crypto = require('crypto');

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a verification token
 * @returns {string} Verification token
 */
const generateVerificationToken = () => {
  return generateRandomString(32);
};

/**
 * Generate a reset token
 * @returns {string} Reset token
 */
const generateResetToken = () => {
  return generateRandomString(32);
};

/**
 * Hash a string using SHA256
 * @param {string} str - String to hash
 * @returns {string} Hashed string
 */
const hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate time ago
 * @param {Date} date - Date to calculate from
 * @returns {string} Time ago string
 */
const timeAgo = (date) => {
  if (!date) return 'N/A';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
};

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Extract domain from email
 * @param {string} email - Email address
 * @returns {string} Domain
 */
const extractDomain = (email) => {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1].toLowerCase();
};

/**
 * Extract URLs from text
 * @param {string} text - Text to extract URLs from
 * @returns {Array} Array of URLs
 */
const extractUrls = (text) => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

/**
 * Check if string is valid JSON
 * @param {string} str - String to check
 * @returns {boolean} True if valid JSON
 */
const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Get object keys as array
 * @param {Object} obj - Object to get keys from
 * @returns {Array} Array of keys
 */
const getKeys = (obj) => {
  return Object.keys(obj);
};

/**
 * Get object values as array
 * @param {Object} obj - Object to get values from
 * @returns {Array} Array of values
 */
const getValues = (obj) => {
  return Object.values(obj);
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
const merge = (target, source) => {
  return { ...target, ...source };
};

/**
 * Pick specific keys from object
 * @param {Object} obj - Object to pick from
 * @param {Array} keys - Keys to pick
 * @returns {Object} Object with picked keys
 */
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omit specific keys from object
 * @param {Object} obj - Object to omit from
 * @param {Array} keys - Keys to omit
 * @returns {Object} Object without omitted keys
 */
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

/**
 * Convert object to query string
 * @param {Object} obj - Object to convert
 * @returns {string} Query string
 */
const toQueryString = (obj) => {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string to parse
 * @returns {Object} Parsed object
 */
const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

module.exports = {
  generateRandomString,
  generateVerificationToken,
  generateResetToken,
  hashString,
  formatDate,
  timeAgo,
  truncate,
  sanitizeInput,
  extractDomain,
  extractUrls,
  isValidJSON,
  deepClone,
  getKeys,
  getValues,
  isEmpty,
  merge,
  pick,
  omit,
  toQueryString,
  parseQueryString,
};
