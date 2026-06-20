const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ThreatReport = require('../models/ThreatReport');

// ── Report Routes ───────────────────────────────────────────────────────────────

// Get all threat reports for authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { threatLevel, limit = 20, skip = 0 } = req.query;

    const query = { userId };
    if (threatLevel) {
      query.threatLevel = threatLevel;
    }

    const reports = await ThreatReport.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('scanResultId', 'scanType input isPhishing riskScore createdAt');

    const total = await ThreatReport.countDocuments(query);

    res.json({
      success: true,
      reports,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching threat reports' 
    });
  }
});

// Get specific threat report by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await ThreatReport.findOne({ _id: id, userId })
      .populate('scanResultId', 'scanType input isPhishing riskScore indicators aiAnalysis threatIntel');

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        error: 'Threat report not found' 
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching threat report' 
    });
  }
});

// Get threat statistics for dashboard
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const reports = await ThreatReport.find({
      userId,
      createdAt: { $gte: startDate }
    });

    // Calculate statistics
    const totalReports = reports.length;
    const threatLevels = {
      critical: reports.filter(r => r.threatLevel === 'critical').length,
      high: reports.filter(r => r.threatLevel === 'high').length,
      medium: reports.filter(r => r.threatLevel === 'medium').length,
      low: reports.filter(r => r.threatLevel === 'low').length
    };

    const attackVectors = reports.reduce((acc, report) => {
      acc[report.attackVector] = (acc[report.attackVector] || 0) + 1;
      return acc;
    }, {});

    const falsePositiveRate = totalReports > 0 
      ? (reports.filter(r => r.isFalsePositive).length / totalReports) * 100 
      : 0;

    const averageConfidence = totalReports > 0
      ? reports.reduce((sum, r) => sum + r.confidenceScore, 0) / totalReports
      : 0;

    res.json({
      success: true,
      stats: {
        totalReports,
        threatLevels,
        attackVectors,
        falsePositiveRate: Math.round(falsePositiveRate * 10) / 10,
        averageConfidence: Math.round(averageConfidence * 10) / 10,
        period
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching threat statistics' 
    });
  }
});

// Update threat report (e.g., mark as false positive)
router.patch('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { isFalsePositive, userFeedback } = req.body;

    const report = await ThreatReport.findOne({ _id: id, userId });

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        error: 'Threat report not found' 
      });
    }

    if (isFalsePositive !== undefined) {
      report.isFalsePositive = isFalsePositive;
    }

    if (userFeedback) {
      report.userFeedback = {
        ...report.userFeedback,
        ...userFeedback,
        submittedAt: new Date()
      };
    }

    await report.save();

    res.json({
      success: true,
      message: 'Threat report updated successfully',
      report
    });

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error updating threat report' 
    });
  }
});

module.exports = router;
