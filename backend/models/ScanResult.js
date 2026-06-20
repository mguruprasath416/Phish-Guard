const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scanType: {
    type: String,
    enum: ['email', 'url'],
    required: true
  },
  input: {
    type: String,
    required: true
  },
  isPhishing: {
    type: Boolean,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  indicators: [{
    type: String
  }],
  aiAnalysis: {
    emailAnalysis: {
      senderReputation: Number,
      subjectSuspicion: Number,
      bodySuspicion: Number,
      urlCount: Number,
      attachmentCount: Number
    },
    urlAnalysis: {
      domainAge: Number,
      sslCertificate: Boolean,
      dnsRecords: Object,
      ipReputation: Number
    }
  },
  threatIntel: {
    virusTotal: {
      malicious: Number,
      suspicious: Number,
      harmless: Number
    },
    googleSafeBrowsing: {
      isMalicious: Boolean
    },
    abuseIPDB: {
      abuseConfidenceScore: Number
    }
  },
  llmExplanation: {
    summary: String,
    keyFindings: [String],
    recommendations: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Index for faster queries
scanResultSchema.index({ userId: 1, createdAt: -1 });
scanResultSchema.index({ scanType: 1, createdAt: -1 });

module.exports = mongoose.model('ScanResult', scanResultSchema);
