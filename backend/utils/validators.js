// Input validation utilities

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateName = (name) => {
  return name && name.trim().length >= 2;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const validateScanInput = (scanType, input) => {
  if (scanType === 'email') {
    const { sender, subject, body } = input;
    return sender && subject && body && 
           validateEmail(sender) && 
           subject.length > 0 && 
           body.length > 0;
  } else if (scanType === 'url') {
    return input.url && validateUrl(input.url);
  }
  return false;
};

const validateToken = (token) => {
  return token && token.length > 0;
};

module.exports = {
  validateEmail,
  validateUrl,
  validatePassword,
  validateName,
  sanitizeInput,
  validateScanInput,
  validateToken
};
