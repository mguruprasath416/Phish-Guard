import React from 'react';
import './UrlReputationCard.css';

const UrlReputationCard = ({ urlAnalysis }) => {
  if (!urlAnalysis) {
    return (
      <div className="url-reputation-card">
        <div className="card-header">
          <h3>URL Reputation</h3>
        </div>
        <div className="no-data">No URL analysis data available</div>
      </div>
    );
  }

  const { domainAge, sslCertificate, ipReputation, dnsRecords } = urlAnalysis;

  const getDomainAgeStatus = (days) => {
    if (days <= 7) return { status: 'Very New', color: '#dc2626' };
    if (days <= 30) return { status: 'New', color: '#ea580c' };
    if (days <= 90) return { status: 'Recent', color: '#ca8a04' };
    if (days <= 365) return { status: 'Established', color: '#16a34a' };
    return { status: 'Well-Established', color: '#16a34a' };
  };

  const getIpReputationStatus = (score) => {
    if (score >= 70) return { status: 'Good', color: '#16a34a' };
    if (score >= 50) return { status: 'Moderate', color: '#ca8a04' };
    return { status: 'Poor', color: '#dc2626' };
  };

  const domainAgeStatus = getDomainAgeStatus(domainAge);
  const ipReputationStatus = getIpReputationStatus(ipReputation);

  return (
    <div className="url-reputation-card">
      <div className="card-header">
        <h3>URL Reputation</h3>
      </div>
      
      <div className="reputation-content">
        {/* Domain Age */}
        <div className="reputation-item">
          <div className="item-label">Domain Age</div>
          <div className="item-value">
            <span className="value-number">{domainAge} days</span>
            <span 
              className="value-status"
              style={{ color: domainAgeStatus.color }}
            >
              {domainAgeStatus.status}
            </span>
          </div>
        </div>

        {/* SSL Certificate */}
        <div className="reputation-item">
          <div className="item-label">SSL Certificate</div>
          <div className="item-value">
            <span 
              className={`ssl-status ${sslCertificate ? 'valid' : 'invalid'}`}
            >
              {sslCertificate ? '✅ Valid' : '❌ Invalid/Missing'}
            </span>
          </div>
        </div>

        {/* IP Reputation */}
        <div className="reputation-item">
          <div className="item-label">IP Reputation</div>
          <div className="item-value">
            <span className="value-number">{Math.round(ipReputation)}/100</span>
            <span 
              className="value-status"
              style={{ color: ipReputationStatus.color }}
            >
              {ipReputationStatus.status}
            </span>
          </div>
        </div>

        {/* DNS Records */}
        {dnsRecords && (
          <div className="reputation-item">
            <div className="item-label">DNS Records</div>
            <div className="dns-info">
              {dnsRecords.ip && (
                <div className="dns-record">
                  <span className="dns-label">IP:</span>
                  <span className="dns-value">{dnsRecords.ip}</span>
                </div>
              )}
              {dnsRecords.domain && (
                <div className="dns-record">
                  <span className="dns-label">Domain:</span>
                  <span className="dns-value">{dnsRecords.domain}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlReputationCard;
