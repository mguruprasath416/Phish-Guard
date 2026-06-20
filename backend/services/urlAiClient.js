const axios = require('axios');
const URL = require('url').URL;

// URL AI Service Client
// This client communicates with the url-service AI microservice

const URL_SERVICE_URL = process.env.URL_SERVICE_URL || 'http://localhost:8002';

// ── Analyze URL ──────────────────────────────────────────────────────────────

async function analyzeUrl(url) {
  try {
    // Validate URL format
    new URL(url);

    // Try to call the AI service if available
    const response = await axios.post(`${URL_SERVICE_URL}/api/predict`, {
      url
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;

  } catch (error) {
    console.error('URL AI service error:', error.message);
    
    // Fallback to rule-based analysis if AI service is unavailable
    return fallbackUrlAnalysis(url);
  }
}

// ── Fallback URL Analysis (Rule-Based) ───────────────────────────────────────

function fallbackUrlAnalysis(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    
    let domainAge = 365; // Default to 1 year (unknown)
    let sslCertificate = urlObj.protocol === 'https:';
    let ipReputation = 70; // Default neutral score
    let suspicionScore = 0;

    // Analyze domain characteristics
    const domainParts = hostname.split('.');
    
    // Check for excessive subdomains
    if (domainParts.length > 4) {
      suspicionScore += 20;
    }

    // Check for suspicious keywords in domain
    const suspiciousKeywords = ['secure', 'verify', 'account', 'login', 'signin', 
                               'bank', 'paypal', 'update', 'confirm', 'support'];
    suspiciousKeywords.forEach(keyword => {
      if (hostname.includes(keyword)) {
        suspicionScore += 15;
      }
    });

    // Check for typosquatting (common brand misspellings)
    const brands = ['google', 'facebook', 'amazon', 'apple', 'microsoft', 'netflix', 
                   'paypal', 'bankofamerica', 'chase', 'wellsfargo'];
    brands.forEach(brand => {
      if (hostname.includes(brand) && !hostname.endsWith(`.${brand}.com`) && 
          !hostname.endsWith(`.${brand}.org`)) {
        suspicionScore += 25;
      }
    });

    // Check for numeric domains
    if (hostname.replace(/\d/g, '').length < hostname.length * 0.5) {
      suspicionScore += 20;
    }

    // Check for homograph attacks (non-ASCII characters)
    if (/[^\x00-\x7F]/.test(hostname)) {
      suspicionScore += 30;
    }

    // Check for suspicious TLDs
    const suspiciousTLDs = ['.xyz', '.top', '.zip', '.tk', '.ml', '.ga', '.cf'];
    suspiciousTLDs.forEach(tld => {
      if (hostname.endsWith(tld)) {
        suspicionScore += 15;
        domainAge = 30; // Assume new domain
      }
    });

    // Analyze URL structure
    if (url.length > 100) {
      suspicionScore += 15;
    }

    if (url.includes('@')) {
      suspicionScore += 35; // Credential theft attempt
    }

    if (pathname.includes('login') || pathname.includes('signin') || 
        pathname.includes('account') || pathname.includes('verify')) {
      suspicionScore += 10;
    }

    // Check for IP address in URL
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      suspicionScore += 40;
      ipReputation = 30;
    }

    // Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 'short.link', 'goo.gl', 't.co'];
    if (shorteners.some(s => hostname.includes(s))) {
      suspicionScore += 20;
    }

    // Calculate domain age (simplified - in production, use WHOIS API)
    if (suspicionScore > 30) {
      domainAge = Math.max(7, domainAge - suspicionScore);
    }

    // Calculate IP reputation (simplified)
    ipReputation = Math.max(0, ipReputation - suspicionScore / 2);

    // Normalize scores
    domainAge = Math.max(1, domainAge);
    ipReputation = Math.max(0, Math.min(100, ipReputation));

    return {
      domainAge,
      sslCertificate,
      dnsRecords: {
        ip: ipReputation < 50 ? 'Suspicious IP detected' : 'No suspicious IP',
        domain: hostname
      },
      ipReputation,
      suspicionScore,
      method: 'fallback',
      confidence: Math.max(50, 100 - suspicionScore)
    };

  } catch (error) {
    // Invalid URL
    return {
      domainAge: 0,
      sslCertificate: false,
      dnsRecords: { error: 'Invalid URL' },
      ipReputation: 0,
      suspicionScore: 100,
      method: 'fallback',
      confidence: 0
    };
  }
}

// ── Check URL Service Health ──────────────────────────────────────────────────

async function checkUrlServiceHealth() {
  try {
    const response = await axios.get(`${URL_SERVICE_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

module.exports = {
  analyzeUrl,
  checkUrlServiceHealth
};
