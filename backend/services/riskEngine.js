// Risk Engine Service
// Calculates comprehensive risk scores based on multiple analysis components

// ── Calculate Risk Score ─────────────────────────────────────────────────────

function calculateRiskScore({ emailAnalysis, urlAnalysis, threatIntel, scanType }) {
  let riskScore = 0;
  let weights = {};

  if (scanType === 'email') {
    weights = {
      senderReputation: 0.25,
      subjectSuspicion: 0.20,
      bodySuspicion: 0.25,
      urlCount: 0.10,
      threatIntel: 0.20
    };

    // Calculate email-based risk
    const senderRisk = (100 - emailAnalysis.senderReputation) * weights.senderReputation;
    const subjectRisk = emailAnalysis.subjectSuspicion * weights.subjectSuspicion;
    const bodyRisk = emailAnalysis.bodySuspicion * weights.bodySuspicion;
    const urlRisk = Math.min(emailAnalysis.urlCount * 10, 100) * weights.urlCount;
    
    // Threat intel risk
    const intelRisk = calculateThreatIntelRisk(threatIntel) * weights.threatIntel;

    riskScore = senderRisk + subjectRisk + bodyRisk + urlRisk + intelRisk;

  } else if (scanType === 'url') {
    weights = {
      domainAge: 0.20,
      sslCertificate: 0.15,
      ipReputation: 0.25,
      suspicionScore: 0.25,
      threatIntel: 0.15
    };

    // Calculate URL-based risk
    const domainRisk = calculateDomainAgeRisk(urlAnalysis.domainAge) * weights.domainAge;
    const sslRisk = urlAnalysis.sslCertificate ? 0 : 100 * weights.sslCertificate;
    const ipRisk = (100 - urlAnalysis.ipReputation) * weights.ipReputation;
    const suspicionRisk = urlAnalysis.suspicionScore * weights.suspicionScore;
    
    // Threat intel risk
    const intelRisk = calculateThreatIntelRisk(threatIntel) * weights.threatIntel;

    riskScore = domainRisk + sslRisk + ipRisk + suspicionRisk + intelRisk;
  }

  // Normalize to 0-100 range
  riskScore = Math.max(0, Math.min(100, riskScore));

  return Math.round(riskScore * 10) / 10; // Round to 1 decimal place
}

// ── Calculate Threat Intelligence Risk ───────────────────────────────────────

function calculateThreatIntelRisk(threatIntel) {
  let risk = 0;

  if (threatIntel.virusTotal) {
    const { malicious, suspicious, harmless } = threatIntel.virusTotal;
    const total = malicious + suspicious + harmless;
    
    if (total > 0) {
      const maliciousRatio = malicious / total;
      const suspiciousRatio = suspicious / total;
      risk += (maliciousRatio * 100) + (suspiciousRatio * 50);
    }
  }

  if (threatIntel.googleSafeBrowsing?.isMalicious) {
    risk += 40;
  }

  if (threatIntel.abuseIPDB) {
    risk += threatIntel.abuseIPDB.abuseConfidenceScore * 0.5;
  }

  return Math.min(100, risk);
}

// ── Calculate Domain Age Risk ────────────────────────────────────────────────

function calculateDomainAgeRisk(domainAgeDays) {
  if (domainAgeDays <= 7) return 90; // Very new domain
  if (domainAgeDays <= 30) return 70; // New domain
  if (domainAgeDays <= 90) return 50; // Recent domain
  if (domainAgeDays <= 180) return 30; // Moderately new
  if (domainAgeDays <= 365) return 15; // Established
  return 5; // Well-established
}

// ── Determine Threat Level ───────────────────────────────────────────────────

function determineThreatLevel(riskScore) {
  if (riskScore >= 80) return 'critical';
  if (riskScore >= 60) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
}

// ── Calculate Confidence Score ──────────────────────────────────────────────

function calculateConfidenceScore({ riskScore, indicators, dataQuality = 'high' }) {
  let confidence = riskScore;

  // Adjust based on number of indicators
  if (indicators.length >= 5) {
    confidence += 10;
  } else if (indicators.length >= 3) {
    confidence += 5;
  } else if (indicators.length === 0) {
    confidence -= 10;
  }

  // Adjust based on data quality
  if (dataQuality === 'high') {
    confidence += 5;
  } else if (dataQuality === 'low') {
    confidence -= 15;
  }

  // Normalize to 0-100 range
  confidence = Math.max(0, Math.min(100, confidence));

  return Math.round(confidence * 10) / 10;
}

// ── Ensemble Risk Calculation (Multiple Models) ─────────────────────────────

function ensembleRiskCalculation(models) {
  // models is an array of risk scores from different models
  if (!models || models.length === 0) return 50;

  // Calculate weighted average (can be customized based on model performance)
  const weights = models.map(() => 1 / models.length);
  
  const weightedSum = models.reduce((sum, score, index) => {
    return sum + (score * weights[index]);
  }, 0);

  return Math.round(weightedSum * 10) / 10;
}

// ── Calculate Risk Trend ────────────────────────────────────────────────────

function calculateRiskTrend(historicalScores) {
  if (!historicalScores || historicalScores.length < 2) {
    return 'stable';
  }

  const recent = historicalScores.slice(-5); // Last 5 scores
  const average = recent.reduce((a, b) => a + b, 0) / recent.length;
  const previous = historicalScores.slice(-10, -5);
  const previousAverage = previous.length > 0 
    ? previous.reduce((a, b) => a + b, 0) / previous.length 
    : average;

  const change = average - previousAverage;

  if (change > 20) return 'increasing';
  if (change < -20) return 'decreasing';
  return 'stable';
}

// ── Risk Threshold Configuration ───────────────────────────────────────────

const RISK_THRESHOLDS = {
  email: {
    low: 30,
    medium: 50,
    high: 70,
    critical: 85
  },
  url: {
    low: 25,
    medium: 45,
    high: 65,
    critical: 80
  }
};

// ── Get Risk Threshold ─────────────────────────────────────────────────────

function getRiskThreshold(scanType, level) {
  return RISK_THRESHOLDS[scanType]?.[level] || RISK_THRESHOLDS.email[level];
}

// ── Validate Risk Score ───────────────────────────────────────────────────

function validateRiskScore(score) {
  if (typeof score !== 'number' || isNaN(score)) {
    return 50; // Default to medium risk
  }
  return Math.max(0, Math.min(100, score));
}

module.exports = {
  calculateRiskScore,
  calculateThreatIntelRisk,
  calculateDomainAgeRisk,
  determineThreatLevel,
  calculateConfidenceScore,
  ensembleRiskCalculation,
  calculateRiskTrend,
  RISK_THRESHOLDS,
  getRiskThreshold,
  validateRiskScore
};
