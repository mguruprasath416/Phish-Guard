const axios = require('axios');

// LLM Service Client
// This client communicates with the llm-service AI microservice

const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:8004';

// ── Generate Explanation ─────────────────────────────────────────────────────

async function generateExplanation({ type, analysis, threatIntel, riskScore }) {
  try {
    // Try to call the LLM service if available
    const response = await axios.post(`${LLM_SERVICE_URL}/api/explain`, {
      type,
      analysis,
      threatIntel,
      riskScore
    }, {
      timeout: 15000, // 15 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;

  } catch (error) {
    console.error('LLM service error:', error.message);
    
    // Fallback to template-based explanation
    return fallbackExplanation({ type, analysis, threatIntel, riskScore });
  }
}

// ── Fallback Explanation (Template-Based) ───────────────────────────────────

function fallbackExplanation({ type, analysis, threatIntel, riskScore }) {
  const isHighRisk = riskScore > 60;
  const isCritical = riskScore > 80;

  let summary = '';
  let keyFindings = [];
  let recommendations = [];

  if (type === 'email') {
    if (isCritical) {
      summary = 'This email exhibits multiple indicators of a sophisticated phishing attack. Immediate action is recommended.';
      keyFindings = [
        'Multiple suspicious patterns detected in email content',
        `Sender reputation score: ${analysis.senderReputation}/100`,
        `Subject suspicion score: ${analysis.subjectSuspicion}/100`,
        `Body content suspicion score: ${analysis.bodySuspicion}/100`,
        `URLs detected: ${analysis.urlCount}`,
        threatIntel.virusTotal?.malicious > 0 ? 'VirusTotal has flagged this sender/domain' : 'No VirusTotal detections',
        threatIntel.googleSafeBrowsing?.isMalicious ? 'Google Safe Browsing has flagged this as malicious' : 'No Safe Browsing detections'
      ];
      recommendations = [
        'Do not click any links in this email',
        'Do not download any attachments',
        'Do not provide any personal or financial information',
        'Report this email to your IT security team',
        'Delete the email immediately',
        'If you have already clicked links or provided information, change your passwords immediately'
      ];
    } else if (isHighRisk) {
      summary = 'This email shows several suspicious characteristics that warrant caution.';
      keyFindings = [
        `Sender reputation score: ${analysis.senderReputation}/100`,
        `Subject suspicion score: ${analysis.subjectSuspicion}/100`,
        `Body content suspicion score: ${analysis.bodySuspicion}/100`,
        `URLs detected: ${analysis.urlCount}`,
        analysis.urlCount > 3 ? 'Multiple URLs present - verify each before clicking' : 'URLs present - exercise caution'
      ];
      recommendations = [
        'Verify the sender\'s identity through a separate channel',
        'Hover over links to check the actual destination before clicking',
        'Do not provide sensitive information without verification',
        'Consider reporting this email if you\'re unsure about its legitimacy'
      ];
    } else {
      summary = 'This email appears to be legitimate based on our analysis, but always exercise caution.';
      keyFindings = [
        `Sender reputation score: ${analysis.senderReputation}/100`,
        `Subject suspicion score: ${analysis.subjectSuspicion}/100`,
        `Body content suspicion score: ${analysis.bodySuspicion}/100`,
        'No major threat intelligence detections'
      ];
      recommendations = [
        'Still verify the sender if you weren\'t expecting this email',
        'Be cautious with any links or attachments',
        'Trust your instincts - if something seems off, verify it'
      ];
    }
  } else if (type === 'url') {
    if (isCritical) {
      summary = 'This URL exhibits multiple high-risk characteristics and is likely malicious.';
      keyFindings = [
        `Domain age: ${analysis.domainAge} days (new domains are often used in phishing)`,
        `SSL Certificate: ${analysis.sslCertificate ? 'Present' : 'Missing (major risk indicator)'}`,
        `IP reputation score: ${analysis.ipReputation}/100`,
        `Suspicion score: ${analysis.suspicionScore}/100`,
        threatIntel.virusTotal?.malicious > 0 ? 'VirusTotal has flagged this URL' : 'No VirusTotal detections',
        threatIntel.googleSafeBrowsing?.isMalicious ? 'Google Safe Browsing has flagged this as malicious' : 'No Safe Browsing detections',
        threatIntel.abuseIPDB?.abuseConfidenceScore > 50 ? `AbuseIPDB confidence: ${threatIntel.abuseIPDB.abuseConfidenceScore}%` : 'Low abuse confidence'
      ];
      recommendations = [
        'Do not visit this URL under any circumstances',
        'Block this URL if possible',
        'Report this URL to your security team',
        'If you have already visited this URL, scan your system for malware',
        'Change any passwords you may have entered after visiting'
      ];
    } else if (isHighRisk) {
      summary = 'This URL shows several suspicious characteristics that warrant caution.';
      keyFindings = [
        `Domain age: ${analysis.domainAge} days`,
        `SSL Certificate: ${analysis.sslCertificate ? 'Present' : 'Missing'}`,
        `IP reputation score: ${analysis.ipReputation}/100`,
        `Suspicion score: ${analysis.suspicionScore}/100`,
        analysis.suspicionScore > 30 ? 'Multiple suspicious patterns detected' : 'Some suspicious patterns detected'
      ];
      recommendations = [
        'Do not visit this URL unless absolutely necessary',
        'Verify the URL through official channels if you must visit',
        'Use a sandboxed environment if you need to test the URL',
        'Report this URL to your security team for further investigation'
      ];
    } else {
      summary = 'This URL appears to be relatively safe based on our analysis.';
      keyFindings = [
        `Domain age: ${analysis.domainAge} days`,
        `SSL Certificate: ${analysis.sslCertificate ? 'Present' : 'Missing'}`,
        `IP reputation score: ${analysis.ipReputation}/100`,
        `Suspicion score: ${analysis.suspicionScore}/100`,
        'No major threat intelligence detections'
      ];
      recommendations = [
        'Still exercise normal caution when visiting any URL',
        'Ensure the URL is what you expected before visiting',
        'Look for HTTPS and valid SSL certificates'
      ];
    }
  }

  return {
    summary,
    keyFindings,
    recommendations,
    method: 'fallback',
    confidence: Math.max(50, 100 - riskScore / 2)
  };
}

// ── Generate Threat Report ───────────────────────────────────────────────────

async function generateThreatReport({ scanResult, threatLevel }) {
  try {
    const response = await axios.post(`${LLM_SERVICE_URL}/api/report`, {
      scanResult,
      threatLevel
    }, {
      timeout: 20000, // 20 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;

  } catch (error) {
    console.error('LLM report generation error:', error.message);
    
    // Fallback to template-based report
    return fallbackThreatReport({ scanResult, threatLevel });
  }
}

// ── Fallback Threat Report ───────────────────────────────────────────────────

function fallbackThreatReport({ scanResult, threatLevel }) {
  const { scanType, input, isPhishing, riskScore, indicators } = scanResult;

  const executiveSummary = isPhishing
    ? `This ${scanType} has been identified as ${threatLevel} risk with a confidence score of ${riskScore}%. Multiple indicators of compromise were detected.`
    : `This ${scanType} appears to be legitimate with a low risk score of ${riskScore}%. No significant threats were detected.`;

  const detailedAnalysis = indicators.length > 0
    ? `Analysis detected ${indicators.length} suspicious indicators: ${indicators.join(', ')}. These patterns are commonly associated with ${threatLevel} severity threats.`
    : 'Analysis did not detect any significant suspicious patterns. The content appears to follow normal communication patterns.';

  const attackVector = scanType === 'email' ? 'phishing' : 'credential_theft';

  const mitigationSteps = isPhishing
    ? [
        { priority: 'critical', action: 'Block sender/domain', description: 'Immediately block the sender or domain to prevent further contact' },
        { priority: 'high', action: 'Report to security team', description: 'Escalate to your organization\'s security team for investigation' },
        { priority: 'high', action: 'User awareness', description: 'Educate users about the specific attack patterns detected' },
        { priority: 'medium', action: 'Update filters', description: 'Update email filters or web filters to block similar threats' }
      ]
    : [
        { priority: 'low', action: 'Monitor', description: 'Continue monitoring for similar patterns' },
        { priority: 'low', action: 'Log for analysis', description: 'Log this analysis for future reference and pattern detection' }
      ];

  return {
    executiveSummary,
    detailedAnalysis,
    attackVector,
    mitigationSteps,
    method: 'fallback'
  };
}

// ── Check LLM Service Health ─────────────────────────────────────────────────

async function checkLLMServiceHealth() {
  try {
    const response = await axios.get(`${LLM_SERVICE_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateExplanation,
  generateThreatReport,
  checkLLMServiceHealth
};
