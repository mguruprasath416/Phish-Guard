const axios = require('axios');

// Threat Intelligence Client
// This client communicates with threat-intel microservice and external APIs

const THREAT_INTEL_URL = process.env.THREAT_INTEL_URL || 'http://localhost:8003';

// ── Check Threat Intelligence ─────────────────────────────────────────────────

async function checkThreatIntel(type, target) {
  try {
    // Try to call the threat intel service if available
    const response = await axios.post(`${THREAT_INTEL_URL}/api/check`, {
      type,
      target
    }, {
      timeout: 15000, // 15 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;

  } catch (error) {
    console.error('Threat intel service error:', error.message);
    
    // Fallback to direct API calls or mock data
    return fallbackThreatIntel(type, target);
  }
}

// ── Fallback Threat Intelligence (Mock/Direct API) ───────────────────────────

async function fallbackThreatIntel(type, target) {
  // In production, this would call actual APIs like VirusTotal, Google Safe Browsing, etc.
  // For now, we'll return mock data based on analysis
  
  const virusTotal = {
    malicious: 0,
    suspicious: 0,
    harmless: 0
  };

  const googleSafeBrowsing = {
    isMalicious: false
  };

  const abuseIPDB = {
    abuseConfidenceScore: 0
  };

  // Simple heuristic-based threat detection
  if (type === 'email') {
    // Check email against known patterns
    const suspiciousPatterns = [
      /@.*\.xyz$/i,
      /@.*\.top$/i,
      /@.*\.tk$/i,
      /support.*\d{5,}/i,
      /noreply.*\d{5,}/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(target))) {
      virusTotal.malicious = 2;
      virusTotal.suspicious = 3;
      virusTotal.harmless = 55;
      googleSafeBrowsing.isMalicious = true;
      abuseIPDB.abuseConfidenceScore = 45;
    } else {
      virusTotal.harmless = 60;
      abuseIPDB.abuseConfidenceScore = 5;
    }

  } else if (type === 'url') {
    try {
      const urlObj = new URL(target);
      const hostname = urlObj.hostname;

      // Check URL against known patterns
      const suspiciousPatterns = [
        /\.xyz$/i,
        /\.top$/i,
        /\.tk$/i,
        /\.ml$/i,
        /\.ga$/i,
        /\.cf$/i,
        /secure.*login/i,
        /verify.*account/i,
        /bit\.ly/i,
        /tinyurl/i
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(hostname))) {
        virusTotal.malicious = 3;
        virusTotal.suspicious = 5;
        virusTotal.harmless = 52;
        googleSafeBrowsing.isMalicious = true;
        abuseIPDB.abuseConfidenceScore = 60;
      } else if (hostname.replace(/\d/g, '').length < hostname.length * 0.5) {
        // Numeric hostname
        virusTotal.malicious = 2;
        virusTotal.suspicious = 4;
        virusTotal.harmless = 54;
        abuseIPDB.abuseConfidenceScore = 50;
      } else {
        virusTotal.harmless = 60;
        abuseIPDB.abuseConfidenceScore = 10;
      }

    } catch (error) {
      // Invalid URL
      virusTotal.malicious = 5;
      virusTotal.suspicious = 5;
      virusTotal.harmless = 50;
      googleSafeBrowsing.isMalicious = true;
      abuseIPDB.abuseConfidenceScore = 70;
    }
  }

  return {
    virusTotal,
    googleSafeBrowsing,
    abuseIPDB,
    method: 'fallback',
    timestamp: new Date().toISOString()
  };
}

// ── Check VirusTotal Directly (if API key available) ─────────────────────────

async function checkVirusTotal(target, apiKey) {
  if (!apiKey) {
    return { malicious: 0, suspicious: 0, harmless: 0, error: 'No API key' };
  }

  try {
    const url = target.startsWith('http') ? target : `mailto:${target}`;
    
    const response = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      { url },
      {
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const analysisId = response.data.data.id;
    
    // Get analysis results
    const analysisResponse = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          'x-apikey': apiKey
        },
        timeout: 10000
      }
    );

    const stats = analysisResponse.data.data.attributes.stats;
    
    return {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      timeout: stats.timeout || 0
    };

  } catch (error) {
    console.error('VirusTotal API error:', error.message);
    return { malicious: 0, suspicious: 0, harmless: 0, error: error.message };
  }
}

// ── Check Google Safe Browsing Directly (if API key available) ─────────────

async function checkGoogleSafeBrowsing(target, apiKey) {
  if (!apiKey) {
    return { isMalicious: false, error: 'No API key' };
  }

  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: {
          clientId: 'phishguard-ai',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: target }]
        }
      },
      { timeout: 10000 }
    );

    const isMalicious = response.data.matches && response.data.matches.length > 0;
    
    return {
      isMalicious,
      matches: response.data.matches || []
    };

  } catch (error) {
    console.error('Google Safe Browsing API error:', error.message);
    return { isMalicious: false, error: error.message };
  }
}

// ── Check Threat Intel Service Health ─────────────────────────────────────────

async function checkThreatIntelHealth() {
  try {
    const response = await axios.get(`${THREAT_INTEL_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

module.exports = {
  checkThreatIntel,
  checkVirusTotal,
  checkGoogleSafeBrowsing,
  checkThreatIntelHealth
};
