const ScanResult = require('../models/ScanResult');
const ThreatReport = require('../models/ThreatReport');
const { analyzeEmail } = require('../services/emailAiClient');
const { analyzeUrl } = require('../services/urlAiClient');
const { checkThreatIntel } = require('../services/threatIntelClient');
const { generateExplanation } = require('../services/llmClient');
const { calculateRiskScore } = require('../services/riskEngine');

// ── Scan Email ─────────────────────────────────────────────────────────────────

const scanEmail = async (req, res) => {
  try {
    const { sender, subject, body, attachments } = req.body;
    const userId = req.user._id;

    if (!sender || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sender, subject, and body are required' 
      });
    }

    // Create initial scan result with pending status
    const scanResult = new ScanResult({
      userId,
      scanType: 'email',
      input: JSON.stringify({ sender, subject, body }),
      isPhishing: false,
      confidence: 0,
      riskScore: 0,
      indicators: [],
      status: 'pending'
    });

    await scanResult.save();

    // Perform AI analysis
    try {
      const emailAnalysis = await analyzeEmail({ sender, subject, body, attachments });
      
      // Check threat intelligence
      const threatIntel = await checkThreatIntel('email', sender);

      // Calculate risk score
      const riskScore = calculateRiskScore({
        emailAnalysis,
        threatIntel,
        scanType: 'email'
      });

      // Generate LLM explanation
      const llmExplanation = await generateExplanation({
        type: 'email',
        analysis: emailAnalysis,
        threatIntel,
        riskScore
      });

      // Determine if phishing based on risk score
      const isPhishing = riskScore > 50;
      const confidence = Math.min(riskScore + 20, 100);

      // Extract indicators
      const indicators = [];
      if (emailAnalysis.senderReputation < 50) indicators.push('Suspicious sender reputation');
      if (emailAnalysis.subjectSuspicion > 60) indicators.push('Suspicious subject patterns');
      if (emailAnalysis.bodySuspicion > 60) indicators.push('Suspicious body content');
      if (emailAnalysis.urlCount > 3) indicators.push('Multiple URLs detected');
      if (threatIntel.virusTotal?.malicious > 0) indicators.push('VirusTotal detection');
      if (threatIntel.googleSafeBrowsing?.isMalicious) indicators.push('Google Safe Browsing detection');

      // Update scan result
      scanResult.isPhishing = isPhishing;
      scanResult.confidence = confidence;
      scanResult.riskScore = riskScore;
      scanResult.indicators = indicators;
      scanResult.aiAnalysis = { emailAnalysis };
      scanResult.threatIntel = threatIntel;
      scanResult.llmExplanation = llmExplanation;
      scanResult.status = 'completed';
      scanResult.completedAt = new Date();

      await scanResult.save();

      // Generate threat report for high-risk scans
      let threatReport = null;
      if (riskScore > 60) {
        const threatLevel = riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : 'medium';
        
        threatReport = new ThreatReport({
          scanResultId: scanResult._id,
          userId,
          threatLevel,
          executiveSummary: llmExplanation.summary,
          detailedAnalysis: llmExplanation.keyFindings.join('\n'),
          mitigationSteps: llmExplanation.recommendations.map((rec, idx) => ({
            priority: idx === 0 ? 'high' : 'medium',
            action: rec,
            description: rec
          })),
          confidenceScore: confidence
        });

        await threatReport.save();
      }

      res.json({
        success: true,
        scanResult: {
          id: scanResult._id,
          isPhishing,
          confidence,
          riskScore,
          indicators,
          aiAnalysis: scanResult.aiAnalysis,
          threatIntel: scanResult.threatIntel,
          llmExplanation: scanResult.llmExplanation,
          threatReportId: threatReport?._id
        }
      });

    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
      scanResult.status = 'failed';
      scanResult.errorMessage = analysisError.message;
      await scanResult.save();
      
      // Fallback to basic analysis
      const basicIndicators = analyzeBasicEmail(sender, subject, body);
      const basicRiskScore = basicIndicators.length * 20;
      
      res.json({
        success: true,
        scanResult: {
          id: scanResult._id,
          isPhishing: basicRiskScore > 40,
          confidence: Math.min(basicRiskScore + 30, 100),
          riskScore: basicRiskScore,
          indicators: basicIndicators,
          fallback: true
        }
      });
    }

  } catch (error) {
    console.error('Scan email error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error scanning email' 
    });
  }
};

// ── Scan URL ───────────────────────────────────────────────────────────────────

const scanUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user._id;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid URL format' 
      });
    }

    // Create initial scan result
    const scanResult = new ScanResult({
      userId,
      scanType: 'url',
      input: url,
      isPhishing: false,
      confidence: 0,
      riskScore: 0,
      indicators: [],
      status: 'pending'
    });

    await scanResult.save();

    // Perform AI analysis
    try {
      const urlAnalysis = await analyzeUrl(url);
      
      // Check threat intelligence
      const threatIntel = await checkThreatIntel('url', url);

      // Calculate risk score
      const riskScore = calculateRiskScore({
        urlAnalysis,
        threatIntel,
        scanType: 'url'
      });

      // Generate LLM explanation
      const llmExplanation = await generateExplanation({
        type: 'url',
        analysis: urlAnalysis,
        threatIntel,
        riskScore
      });

      // Determine if phishing
      const isPhishing = riskScore > 50;
      const confidence = Math.min(riskScore + 20, 100);

      // Extract indicators
      const indicators = [];
      if (urlAnalysis.domainAge < 30) indicators.push('Newly registered domain');
      if (!urlAnalysis.sslCertificate) indicators.push('No SSL certificate');
      if (urlAnalysis.ipReputation < 50) indicators.push('Suspicious IP reputation');
      if (threatIntel.virusTotal?.malicious > 0) indicators.push('VirusTotal detection');
      if (threatIntel.googleSafeBrowsing?.isMalicious) indicators.push('Google Safe Browsing detection');
      if (threatIntel.abuseIPDB?.abuseConfidenceScore > 50) indicators.push('AbuseIPDB detection');

      // Update scan result
      scanResult.isPhishing = isPhishing;
      scanResult.confidence = confidence;
      scanResult.riskScore = riskScore;
      scanResult.indicators = indicators;
      scanResult.aiAnalysis = { urlAnalysis };
      scanResult.threatIntel = threatIntel;
      scanResult.llmExplanation = llmExplanation;
      scanResult.status = 'completed';
      scanResult.completedAt = new Date();

      await scanResult.save();

      // Generate threat report for high-risk scans
      let threatReport = null;
      if (riskScore > 60) {
        const threatLevel = riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : 'medium';
        
        threatReport = new ThreatReport({
          scanResultId: scanResult._id,
          userId,
          threatLevel,
          executiveSummary: llmExplanation.summary,
          detailedAnalysis: llmExplanation.keyFindings.join('\n'),
          mitigationSteps: llmExplanation.recommendations.map((rec, idx) => ({
            priority: idx === 0 ? 'high' : 'medium',
            action: rec,
            description: rec
          })),
          technicalDetails: {
            domains: [url],
            ipAddresses: urlAnalysis.dnsRecords?.ip || []
          },
          confidenceScore: confidence
        });

        await threatReport.save();
      }

      res.json({
        success: true,
        scanResult: {
          id: scanResult._id,
          isPhishing,
          confidence,
          riskScore,
          indicators,
          aiAnalysis: scanResult.aiAnalysis,
          threatIntel: scanResult.threatIntel,
          llmExplanation: scanResult.llmExplanation,
          threatReportId: threatReport?._id
        }
      });

    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
      scanResult.status = 'failed';
      scanResult.errorMessage = analysisError.message;
      await scanResult.save();
      
      // Fallback to basic analysis
      const basicIndicators = analyzeBasicUrl(url);
      const basicRiskScore = basicIndicators.length * 20;
      
      res.json({
        success: true,
        scanResult: {
          id: scanResult._id,
          isPhishing: basicRiskScore > 40,
          confidence: Math.min(basicRiskScore + 30, 100),
          riskScore: basicRiskScore,
          indicators: basicIndicators,
          fallback: true
        }
      });
    }

  } catch (error) {
    console.error('Scan URL error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error scanning URL' 
    });
  }
};

// ── Get Scan History ───────────────────────────────────────────────────────────

const getScanHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { scanType, limit = 20, skip = 0 } = req.query;

    const query = { userId };
    if (scanType) {
      query.scanType = scanType;
    }

    const scans = await ScanResult.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-input -llmExplanation.detailedAnalysis');

    const total = await ScanResult.countDocuments(query);

    res.json({
      success: true,
      scans,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching scan history' 
    });
  }
};

// ── Get Scan Result by ID ───────────────────────────────────────────────────────

const getScanResult = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const scanResult = await ScanResult.findOne({ _id: id, userId });

    if (!scanResult) {
      return res.status(404).json({ 
        success: false, 
        error: 'Scan result not found' 
      });
    }

    res.json({
      success: true,
      scanResult
    });

  } catch (error) {
    console.error('Get scan result error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching scan result' 
    });
  }
};

// ── Submit Feedback ─────────────────────────────────────────────────────────────

const submitFeedback = async (req, res) => {
  try {
    const { scanId, isFalsePositive, rating, comments } = req.body;
    const userId = req.user._id;

    const scanResult = await ScanResult.findOne({ _id: scanId, userId });

    if (!scanResult) {
      return res.status(404).json({ 
        success: false, 
        error: 'Scan result not found' 
      });
    }

    // Update threat report if exists
    const threatReport = await ThreatReport.findOne({ scanResultId: scanId });
    
    if (threatReport) {
      threatReport.isFalsePositive = isFalsePositive;
      threatReport.userFeedback = {
        rating,
        comments,
        submittedAt: new Date()
      };
      await threatReport.save();
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error submitting feedback' 
    });
  }
};

// ── Helper Functions ───────────────────────────────────────────────────────────

function analyzeBasicEmail(sender, subject, body) {
  const indicators = [];
  const phishingKeywords = [
    'urgent', 'verify', 'account', 'suspended', 'login',
    'confirm', 'bank', 'security', 'update', 'password'
  ];

  const subjectLower = subject.toLowerCase();
  if (phishingKeywords.some(k => subjectLower.includes(k))) {
    indicators.push('Suspicious subject keywords');
  }
  if (subjectLower.includes('urgent') || subjectLower.includes('immediate')) {
    indicators.push('Urgency in subject');
  }

  const bodyLower = body.toLowerCase();
  if (phishingKeywords.some(k => bodyLower.includes(k))) {
    indicators.push('Suspicious body keywords');
  }

  const urls = body.match(/(https?:\/\/[^\s]+)/g) || [];
  if (urls.length > 0) indicators.push('Contains URLs');

  if (bodyLower.includes('ssn') || bodyLower.includes('credit card') || bodyLower.includes('password')) {
    indicators.push('Requests personal information');
  }

  return indicators;
}

function analyzeBasicUrl(url) {
  const indicators = [];
  
  try {
    const urlObj = new URL(url);
    
    // Check for suspicious patterns
    if (urlObj.hostname.includes('secure') || urlObj.hostname.includes('verify') || 
        urlObj.hostname.includes('account') || urlObj.hostname.includes('login')) {
      indicators.push('Suspicious keywords in domain');
    }
    
    if (urlObj.hostname.split('.').length > 4) {
      indicators.push('Excessive subdomains');
    }
    
    if (urlObj.protocol === 'http:') {
      indicators.push('Unsecure HTTP protocol');
    }
    
    if (url.includes('@')) {
      indicators.push('Contains @ symbol (possible credential theft)');
    }
    
    if (url.length > 100) {
      indicators.push('Unusually long URL');
    }
    
  } catch (e) {
    indicators.push('Invalid URL format');
  }
  
  return indicators;
}

module.exports = {
  scanEmail,
  scanUrl,
  getScanHistory,
  getScanResult,
  submitFeedback
};
