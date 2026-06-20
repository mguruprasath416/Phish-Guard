import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreatReport } from '../api/reportApi';
import ScanSummaryCard from '../components/ScanSummaryCard';
import ThreatGauge from '../components/ThreatGauge';
import AIExplanationCard from '../components/AIExplanationCard';
import './ThreatReport.css';

const ThreatReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getThreatReport(id);
        setReport(data.report);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="threat-report-page">
        <div className="loading">Loading threat report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="threat-report-page">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="threat-report-page">
        <div className="error">
          <h2>Report Not Found</h2>
          <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const { threatLevel, executiveSummary, detailedAnalysis, attackVector, 
         mitigationSteps, indicatorsOfCompromise, technicalDetails, 
         confidenceScore, userFeedback } = report;

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  return (
    <div className="threat-report-page">
      <div className="report-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Threat Report</h1>
        <div className="threat-badge" style={{ backgroundColor: getThreatLevelColor(threatLevel) }}>
          {threatLevel.toUpperCase()}
        </div>
      </div>

      <div className="report-content">
        {/* Executive Summary */}
        <div className="report-section">
          <h2>Executive Summary</h2>
          <p>{executiveSummary}</p>
        </div>

        {/* Risk Score */}
        <div className="report-section centered">
          <h2>Risk Assessment</h2>
          <ThreatGauge riskScore={confidenceScore} size={250} />
          <div className="confidence-display">
            <span>Confidence Score: </span>
            <strong>{Math.round(confidenceScore)}%</strong>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="report-section">
          <h2>Detailed Analysis</h2>
          <div className="analysis-text">
            {detailedAnalysis}
          </div>
        </div>

        {/* Attack Vector */}
        <div className="report-section">
          <h2>Attack Vector</h2>
          <div className="attack-vector">
            <span className="vector-type">{attackVector}</span>
          </div>
        </div>

        {/* Indicators of Compromise */}
        {indicatorsOfCompromise && indicatorsOfCompromise.length > 0 && (
          <div className="report-section">
            <h2>Indicators of Compromise</h2>
            <div className="ioc-list">
              {indicatorsOfCompromise.map((ioc, index) => (
                <div key={index} className="ioc-item">
                  <div className="ioc-type">{ioc.type}</div>
                  <div className="ioc-description">{ioc.description}</div>
                  <div className={`ioc-severity ${ioc.severity}`}>{ioc.severity}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mitigation Steps */}
        {mitigationSteps && mitigationSteps.length > 0 && (
          <div className="report-section">
            <h2>Mitigation Steps</h2>
            <div className="mitigation-list">
              {mitigationSteps.map((step, index) => (
                <div key={index} className={`mitigation-item ${step.priority}`}>
                  <div className="step-priority">{step.priority.toUpperCase()}</div>
                  <div className="step-action">{step.action}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Details */}
        {technicalDetails && (
          <div className="report-section">
            <h2>Technical Details</h2>
            <div className="technical-details">
              {technicalDetails.networkIndicators && technicalDetails.networkIndicators.length > 0 && (
                <div className="detail-group">
                  <h3>Network Indicators</h3>
                  <ul>
                    {technicalDetails.networkIndicators.map((indicator, index) => (
                      <li key={index}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
              {technicalDetails.domains && technicalDetails.domains.length > 0 && (
                <div className="detail-group">
                  <h3>Domains</h3>
                  <ul>
                    {technicalDetails.domains.map((domain, index) => (
                      <li key={index}>{domain}</li>
                    ))}
                  </ul>
                </div>
              )}
              {technicalDetails.ipAddresses && technicalDetails.ipAddresses.length > 0 && (
                <div className="detail-group">
                  <h3>IP Addresses</h3>
                  <ul>
                    {technicalDetails.ipAddresses.map((ip, index) => (
                      <li key={index}>{ip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Feedback */}
        {userFeedback && (
          <div className="report-section">
            <h2>User Feedback</h2>
            <div className="user-feedback">
              <div className="feedback-rating">
                <span>Rating: </span>
                <strong>{userFeedback.rating}/5</strong>
              </div>
              {userFeedback.comments && (
                <div className="feedback-comments">
                  <span>Comments: </span>
                  <p>{userFeedback.comments}</p>
                </div>
              )}
              <div className="feedback-date">
                Submitted: {new Date(userFeedback.submittedAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Scan Result Summary */}
        {report.scanResultId && (
          <div className="report-section">
            <h2>Scan Result Summary</h2>
            <ScanSummaryCard scanResult={report.scanResultId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatReport;
