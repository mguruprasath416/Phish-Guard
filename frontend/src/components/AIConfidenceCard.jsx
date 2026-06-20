import React from 'react';
import './AIConfidenceCard.css';

const AIConfidenceCard = ({ confidence, analysisType = 'email' }) => {
  const getConfidenceLevel = (score) => {
    if (score >= 80) return { level: 'Very High', color: '#16a34a' };
    if (score >= 60) return { level: 'High', color: '#22c55e' };
    if (score >= 40) return { level: 'Medium', color: '#ca8a04' };
    if (score >= 20) return { level: 'Low', color: '#ea580c' };
    return { level: 'Very Low', color: '#dc2626' };
  };

  const conf = getConfidenceLevel(confidence);

  return (
    <div className="ai-confidence-card">
      <div className="card-header">
        <h3>AI Confidence</h3>
        <span className="analysis-type">{analysisType}</span>
      </div>
      
      <div className="confidence-content">
        <div className="confidence-score" style={{ color: conf.color }}>
          {Math.round(confidence)}%
        </div>
        <div className="confidence-level" style={{ color: conf.color }}>
          {conf.level}
        </div>
        
        <div className="confidence-bar">
          <div 
            className="confidence-fill"
            style={{ 
              width: `${confidence}%`,
              backgroundColor: conf.color 
            }}
          />
        </div>
        
        <div className="confidence-description">
          {confidence >= 80 
            ? 'The AI model is very confident in this analysis.'
            : confidence >= 60
            ? 'The AI model has high confidence in this analysis.'
            : confidence >= 40
            ? 'The AI model has moderate confidence. Manual review recommended.'
            : 'The AI model has low confidence. Manual review strongly recommended.'
          }
        </div>
      </div>
    </div>
  );
};

export default AIConfidenceCard;
