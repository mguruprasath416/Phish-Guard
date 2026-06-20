const axios = require('axios');

// Email AI Service Client
// This client communicates with the email-service AI microservice

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:8001';

// ── Analyze Email ─────────────────────────────────────────────────────────────

async function analyzeEmail({ sender, subject, body, attachments = [] }) {
  try {
    // Try to call the AI service if available
    const response = await axios.post(`${EMAIL_SERVICE_URL}/api/predict`, {
      sender,
      subject,
      body,
      attachments: attachments.map(a => ({
        filename: a.filename,
        contentType: a.contentType,
        size: a.size
      }))
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;

  } catch (error) {
    console.error('Email AI service error:', error.message);
    
    // Fallback to rule-based analysis if AI service is unavailable
    return fallbackEmailAnalysis({ sender, subject, body, attachments });
  }
}

// ── Fallback Email Analysis (Rule-Based) ───────────────────────────────────────

function fallbackEmailAnalysis({ sender, subject, body, attachments }) {
  const senderLower = sender.toLowerCase();
  const subjectLower = subject.toLowerCase();
  const bodyLower = body.toLowerCase();

  // Analyze sender reputation
  let senderReputation = 70; // Default neutral score
  
  // Check for suspicious sender patterns
  if (senderLower.includes('noreply') && senderLower.includes('support')) {
    senderReputation -= 20;
  }
  if (senderLower.match(/\d{5,}/)) {
    senderReputation -= 15; // Suspicious numbers in sender
  }
  if (!sender.includes('@') || sender.includes('..')) {
    senderReputation -= 30;
  }
  if (senderLower.includes('secure') || senderLower.includes('verify')) {
    senderReputation -= 10;
  }

  // Analyze subject
  let subjectSuspicion = 0;
  const urgencyWords = ['urgent', 'immediate', 'action required', 'important', 'alert'];
  const phishingWords = ['verify', 'account', 'suspended', 'confirm', 'security', 'update'];
  
  urgencyWords.forEach(word => {
    if (subjectLower.includes(word)) subjectSuspicion += 15;
  });
  phishingWords.forEach(word => {
    if (subjectLower.includes(word)) subjectSuspicion += 10;
  });

  if (subjectLower.includes('!!!') || subjectLower.includes('???')) {
    subjectSuspicion += 20;
  }

  // Analyze body
  let bodySuspicion = 0;
  const suspiciousPatterns = [
    'verify your account', 'confirm your identity', 'update your information',
    'click here', 'login to continue', 'your account will be',
    'suspended', 'unusual activity', 'security alert'
  ];

  suspiciousPatterns.forEach(pattern => {
    if (bodyLower.includes(pattern)) bodySuspicion += 15;
  });

  // Count URLs
  const urlMatches = body.match(/(https?:\/\/[^\s]+)/g) || [];
  const urlCount = urlMatches.length;
  
  if (urlCount > 3) bodySuspicion += 20;
  if (urlCount > 5) bodySuspicion += 15;

  // Check for suspicious URL patterns
  urlMatches.forEach(url => {
    if (url.includes('bit.ly') || url.includes('tinyurl') || url.includes('short')) {
      bodySuspicion += 15;
    }
    if (url.includes('@')) {
      bodySuspicion += 25; // Credential theft attempt
    }
  });

  // Check for personal information requests
  if (bodyLower.includes('password') || bodyLower.includes('ssn') || 
      bodyLower.includes('credit card') || bodyLower.includes('bank account')) {
    bodySuspicion += 25;
  }

  // Analyze attachments
  const attachmentCount = attachments.length;
  let attachmentSuspicion = 0;
  
  if (attachmentCount > 0) {
    attachments.forEach(att => {
      const ext = att.filename.split('.').pop().toLowerCase();
      const dangerousExts = ['exe', 'scr', 'bat', 'cmd', 'com', 'pif', 'vbs', 'js', 'jar'];
      if (dangerousExts.includes(ext)) {
        attachmentSuspicion += 30;
      }
      if (ext === 'zip' || ext === 'rar') {
        attachmentSuspicion += 15;
      }
      if (att.size > 10 * 1024 * 1024) { // > 10MB
        attachmentSuspicion += 10;
      }
    });
  }

  // Normalize scores
  senderReputation = Math.max(0, Math.min(100, senderReputation));
  subjectSuspicion = Math.max(0, Math.min(100, subjectSuspicion));
  bodySuspicion = Math.max(0, Math.min(100, bodySuspicion));

  return {
    senderReputation,
    subjectSuspicion,
    bodySuspicion,
    urlCount,
    attachmentCount,
    method: 'fallback',
    confidence: Math.max(50, 100 - (subjectSuspicion + bodySuspicion) / 2)
  };
}

// ── Check Email Service Health ─────────────────────────────────────────────────

async function checkEmailServiceHealth() {
  try {
    const response = await axios.get(`${EMAIL_SERVICE_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

module.exports = {
  analyzeEmail,
  checkEmailServiceHealth
};
