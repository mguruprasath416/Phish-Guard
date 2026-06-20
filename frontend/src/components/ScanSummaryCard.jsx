import React from 'react';
import './ScanSummaryCard.css';

const ScanSummaryCard = ({ scanResult }) => {
  if (!scanResult) {
    return (
      <div className="scan-summary-card">
        <div className="card-header">
          <h3>Scan Summary</h3>
        </div>
        <div className="no-data">No scan result available</div>
      </div>
    );
  }

  const { scanType, isPhishing, confidence, riskScore, indicators, createdAt, completedAt } = scanResult;

  const getThreatLevel = (score) => {
    if (score >= 80) return { level: 'Critical', color: '#dc2626' };
    if (score >= 60) return { level: 'High', color: '#ea580c' };
    if (score >= 40) return { level: 'Medium', color: '#ca8a04' };
    return { level: 'Low', color: '#16a34a' };
  };

  const threat = getThreatLevel(riskScore);

  return (
    <div className="scan-summary-card">
      <div className="card-header">
        <h3>Scan Summary</h3>
        <span className="scan-type">{scanType}</span>
      </div>
      
      <div className="summary-content">
        {/* Result */}
        <div className="result-section">
          <div className={`result-badge ${isPhishing ? 'phishing' : 'safe'}`}>
            {isPhishing ? '⚠️ PHISHING DETECTED' : '✅ SAFE'}
          </div>
        </div>

        {/* Risk Score */}
        <div className="score-section">
          <div className="score-label">Risk Score</div>
          <div className="score-value" style={{ color: threat.color }}>
            {Math.round(riskScore)}/100
          </div>
          <div className="score-level" style={{ color: threat.color }}>
            {threat.level}
          </div>
        </div>

        {/* Confidence */}
        <div className="confidence-section">
          <div className="confidence-label">AI Confidence</div>
          <div className="confidence-bar">
            <div 
              className="confidence-fill"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <div className="confidence-value">{Math.round(confidence)}%</div>
        </div>

        {/* Indicators */}
        {indicators && indicators.length > 0 && (
          <div className="indicators-section">
            <div className="indicators-label">Indicators Detected</div>
            <ul className="indicators-list">
              {indicators.map((indicator, index) => (
                <li key={index}>{indicator}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Timestamp */}
        <div className="timestamp-section">
          <div className="timestamp-label">
            Scanned: {new Date(createdAt).toLocaleString()}
          </div>
          {completedAt && (
            <div className="timestamp-label">
              Completed: {new Date(completedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanSummaryCard;
