import React, { useState } from 'react';
import './AIExplanationCard.css';

const AIExplanationCard = ({ llmExplanation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!llmExplanation) {
    return (
      <div className="ai-explanation-card">
        <div className="card-header">
          <h3>AI Explanation</h3>
        </div>
        <div className="no-data">No AI explanation available</div>
      </div>
    );
  }

  const { summary, keyFindings, recommendations } = llmExplanation;

  return (
    <div className="ai-explanation-card">
      <div className="card-header">
        <h3>AI Explanation</h3>
        <button 
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
      
      <div className={`explanation-content ${isExpanded ? 'expanded' : ''}`}>
        {/* Summary */}
        <div className="explanation-section">
          <h4>Summary</h4>
          <p>{summary}</p>
        </div>

        {/* Key Findings */}
        {keyFindings && keyFindings.length > 0 && (
          <div className="explanation-section">
            <h4>Key Findings</h4>
            <ul className="findings-list">
              {keyFindings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="explanation-section">
            <h4>Recommendations</h4>
            <ul className="recommendations-list">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIExplanationCard;
