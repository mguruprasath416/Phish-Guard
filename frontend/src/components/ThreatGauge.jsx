import React from 'react';
import './ThreatGauge.css';

const ThreatGauge = ({ riskScore, size = 200 }) => {
  const getThreatLevel = (score) => {
    if (score >= 80) return { level: 'Critical', color: '#dc2626' };
    if (score >= 60) return { level: 'High', color: '#ea580c' };
    if (score >= 40) return { level: 'Medium', color: '#ca8a04' };
    return { level: 'Low', color: '#16a34a' };
  };

  const threat = getThreatLevel(riskScore);
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="threat-gauge">
      <svg width={size} height={size} className="gauge-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={12}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={threat.color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-progress"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
        
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 10}
          textAnchor="middle"
          className="gauge-score"
          style={{ fontSize: size / 5, fontWeight: 'bold', fill: threat.color }}
        >
          {Math.round(riskScore)}
        </text>
        
        {/* Label */}
        <text
          x={size / 2}
          y={size / 2 + 20}
          textAnchor="middle"
          className="gauge-label"
          style={{ fontSize: size / 10, fill: '#6b7280' }}
        >
          Risk Score
        </text>
        
        {/* Threat level */}
        <text
          x={size / 2}
          y={size / 2 + 45}
          textAnchor="middle"
          className="gauge-level"
          style={{ fontSize: size / 8, fontWeight: 'bold', fill: threat.color }}
        >
          {threat.level}
        </text>
      </svg>
    </div>
  );
};

export default ThreatGauge;
