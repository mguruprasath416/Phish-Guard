import React from 'react';
import './ThreatIntelCard.css';

const ThreatIntelCard = ({ threatIntel }) => {
  if (!threatIntel) {
    return (
      <div className="threat-intel-card">
        <div className="card-header">
          <h3>Threat Intelligence</h3>
        </div>
        <div className="no-data">No threat intelligence data available</div>
      </div>
    );
  }

  const { virusTotal, googleSafeBrowsing, abuseIPDB } = threatIntel;

  return (
    <div className="threat-intel-card">
      <div className="card-header">
        <h3>Threat Intelligence</h3>
      </div>
      
      <div className="intel-content">
        {/* VirusTotal */}
        {virusTotal && (
          <div className="intel-item">
            <div className="intel-label">VirusTotal</div>
            <div className="intel-stats">
              <div className="stat malicious">
                <span className="stat-value">{virusTotal.malicious || 0}</span>
                <span className="stat-label">Malicious</span>
              </div>
              <div className="stat suspicious">
                <span className="stat-value">{virusTotal.suspicious || 0}</span>
                <span className="stat-label">Suspicious</span>
              </div>
              <div className="stat harmless">
                <span className="stat-value">{virusTotal.harmless || 0}</span>
                <span className="stat-label">Harmless</span>
              </div>
            </div>
          </div>
        )}

        {/* Google Safe Browsing */}
        {googleSafeBrowsing && (
          <div className="intel-item">
            <div className="intel-label">Google Safe Browsing</div>
            <div className={`intel-status ${googleSafeBrowsing.isMalicious ? 'danger' : 'safe'}`}>
              {googleSafeBrowsing.isMalicious ? '⚠️ Flagged as Malicious' : '✅ No Threats Detected'}
            </div>
          </div>
        )}

        {/* AbuseIPDB */}
        {abuseIPDB && (
          <div className="intel-item">
            <div className="intel-label">AbuseIPDB</div>
            <div className="intel-abuse-score">
              <span className="abuse-value">{abuseIPDB.abuseConfidenceScore || 0}%</span>
              <span className="abuse-label">Abuse Confidence</span>
            </div>
            {abuseIPDB.abuseConfidenceScore > 50 && (
              <div className="abuse-warning">High abuse confidence detected</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatIntelCard;
