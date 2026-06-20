// Logging utility

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };

  // In development, log to console
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${timestamp}] [${level}] ${message}`, data || '');
  }

  // In production, you might want to send to a logging service
  // e.g., Winston, CloudWatch, etc.
};

const error = (message, data = null) => log(LOG_LEVELS.ERROR, message, data);
const warn = (message, data = null) => log(LOG_LEVELS.WARN, message, data);
const info = (message, data = null) => log(LOG_LEVELS.INFO, message, data);
const debug = (message, data = null) => log(LOG_LEVELS.DEBUG, message, data);

module.exports = {
  error,
  warn,
  info,
  debug,
  LOG_LEVELS
};
