const mongoose = require('mongoose');

const threatReportSchema = new mongoose.Schema({
  scanResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScanResult',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  threatLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  executiveSummary: {
    type: String,
    required: true
  },
  detailedAnalysis: {
    type: String,
    required: true
  },
  attackVector: {
    type: String,
    enum: ['phishing', 'malware', 'social_engineering', 'credential_theft', 'other'],
    default: 'phishing'
  },
  targetedEntities: [String],
  indicatorsOfCompromise: [{
    type: String,
    description: String,
    severity: String
  }],
  mitigationSteps: [{
    priority: String,
    action: String,
    description: String
  }],
  technicalDetails: {
    networkIndicators: [String],
    fileHashes: [String],
    domains: [String],
    ipAddresses: [String]
  },
  timeline: [{
    timestamp: Date,
    event: String,
    description: String
  }],
  relatedThreats: [{
    threatId: String,
    similarity: Number,
    description: String
  }],
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  isFalsePositive: {
    type: Boolean,
    default: false
  },
  userFeedback: {
    rating: Number,
    comments: String,
    submittedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
threatReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
threatReportSchema.index({ userId: 1, createdAt: -1 });
threatReportSchema.index({ scanResultId: 1 });
threatReportSchema.index({ threatLevel: 1 });

module.exports = mongoose.model('ThreatReport', threatReportSchema);
