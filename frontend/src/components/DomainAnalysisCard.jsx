import React from 'react';
import './DomainAnalysisCard.css';

const DomainAnalysisCard = ({ emailAnalysis }) => {
  if (!emailAnalysis) {
    return (
      <div className="domain-analysis-card">
        <div className="card-header">
          <h3>Domain Analysis</h3>
        </div>
        <div className="no-data">No domain analysis data available</div>
      </div>
    );
  }

  const { senderReputation, subjectSuspicion, bodySuspicion, urlCount, attachmentCount } = emailAnalysis;

  const getScoreColor = (score) => {
    if (score >= 70) return '#16a34a';
    if (score >= 50) return '#ca8a04';
    if (score >= 30) return '#ea580c';
    return '#dc2626';
  };

  const getScoreLabel = (score, type) => {
    if (type === 'reputation') {
      if (score >= 70) return 'Good';
      if (score >= 50) return 'Moderate';
      return 'Poor';
    } else {
      if (score >= 70) return 'High Suspicion';
      if (score >= 50) return 'Moderate Suspicion';
      if (score >= 30) return 'Low Suspicion';
      return 'Very Low Suspicion';
    }
  };

  return (
    <div className="domain-analysis-card">
      <div className="card-header">
        <h3>Domain Analysis</h3>
      </div>
      
      <div className="analysis-content">
        {/* Sender Reputation */}
        <div className="analysis-item">
          <div className="item-header">
            <span className="item-label">Sender Reputation</span>
            <span 
              className="item-score"
              style={{ color: getScoreColor(senderReputation) }}
            >
              {Math.round(senderReputation)}/100
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${senderReputation}%`,
                backgroundColor: getScoreColor(senderReputation)
              }}
            />
          </div>
          <div className="item-status">
            {getScoreLabel(senderReputation, 'reputation')}
          </div>
        </div>

        {/* Subject Suspicion */}
        <div className="analysis-item">
          <div className="item-header">
            <span className="item-label">Subject Suspicion</span>
            <span 
              className="item-score"
              style={{ color: getScoreColor(100 - subjectSuspicion) }}
            >
              {Math.round(subjectSuspicion)}/100
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${subjectSuspicion}%`,
                backgroundColor: getScoreColor(100 - subjectSuspicion)
              }}
            />
          </div>
          <div className="item-status">
            {getScoreLabel(subjectSuspicion, 'suspicion')}
          </div>
        </div>

        {/* Body Suspicion */}
        <div className="analysis-item">
          <div className="item-header">
            <span className="item-label">Body Suspicion</span>
            <span 
              className="item-score"
              style={{ color: getScoreColor(100 - bodySuspicion) }}
            >
              {Math.round(bodySuspicion)}/100
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${bodySuspicion}%`,
                backgroundColor: getScoreColor(100 - bodySuspicion)
              }}
            />
          </div>
          <div className="item-status">
            {getScoreLabel(bodySuspicion, 'suspicion')}
          </div>
        </div>

        {/* URL Count */}
        <div className="analysis-item">
          <div className="item-header">
            <span className="item-label">URLs Detected</span>
            <span className="item-count">{urlCount}</span>
          </div>
          {urlCount > 3 && (
            <div className="item-warning">
              ⚠️ Multiple URLs detected - exercise caution
            </div>
          )}
        </div>

        {/* Attachment Count */}
        <div className="analysis-item">
          <div className="item-header">
            <span className="item-label">Attachments</span>
            <span className="item-count">{attachmentCount}</span>
          </div>
          {attachmentCount > 0 && (
            <div className="item-warning">
              ⚠️ Attachments present - verify before opening
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainAnalysisCard;
