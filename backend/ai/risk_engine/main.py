#!/usr/bin/env python3
"""
Risk Engine Service
FastAPI service for calculating comprehensive risk scores
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn

app = FastAPI(
    title="Risk Engine Service",
    description="Comprehensive risk score calculation service",
    version="1.0.0"
)

# ── Models ─────────────────────────────────────────────────────────────────

class EmailAnalysis(BaseModel):
    senderReputation: float
    subjectSuspicion: float
    bodySuspicion: float
    urlCount: int
    attachmentCount: int

class UrlAnalysis(BaseModel):
    domainAge: int
    sslCertificate: bool
    ipReputation: float
    suspicionScore: float

class ThreatIntel(BaseModel):
    virusTotal: Dict[str, int]
    googleSafeBrowsing: Dict[str, bool]
    abuseIPDB: Dict[str, int]

class RiskRequest(BaseModel):
    scanType: str  # 'email' or 'url'
    emailAnalysis: Optional[EmailAnalysis] = None
    urlAnalysis: Optional[UrlAnalysis] = None
    threatIntel: ThreatIntel

class RiskResponse(BaseModel):
    riskScore: float
    threatLevel: str
    confidence: float
    breakdown: Dict[str, float]

# ── Health Check ───────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "risk-engine"}

# ── Calculate Risk Endpoint ─────────────────────────────────────────────────

@app.post("/api/calculate", response_model=RiskResponse)
async def calculate_risk(request: RiskRequest):
    """
    Calculate comprehensive risk score
    """
    try:
        if request.scanType == "email" and request.emailAnalysis:
            risk_score = calculate_email_risk(request.emailAnalysis, request.threatIntel)
        elif request.scanType == "url" and request.urlAnalysis:
            risk_score = calculate_url_risk(request.urlAnalysis, request.threatIntel)
        else:
            raise HTTPException(status_code=400, detail="Invalid scan type or missing analysis")
        
        threat_level = determine_threat_level(risk_score)
        confidence = min(100, risk_score + 20)
        
        return RiskResponse(
            riskScore=round(risk_score, 1),
            threatLevel=threat_level,
            confidence=round(confidence, 1),
            breakdown={"calculated_risk": risk_score}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Calculate Email Risk ───────────────────────────────────────────────────

def calculate_email_risk(analysis: EmailAnalysis, intel: ThreatIntel) -> float:
    """Calculate risk score for email"""
    weights = {
        "senderReputation": 0.25,
        "subjectSuspicion": 0.20,
        "bodySuspicion": 0.25,
        "urlCount": 0.10,
        "threatIntel": 0.20
    }
    
    sender_risk = (100 - analysis.senderReputation) * weights["senderReputation"]
    subject_risk = analysis.subjectSuspicion * weights["subjectSuspicion"]
    body_risk = analysis.bodySuspicion * weights["bodySuspicion"]
    url_risk = min(analysis.urlCount * 10, 100) * weights["urlCount"]
    intel_risk = calculate_threat_intel_risk(intel) * weights["threatIntel"]
    
    total_risk = sender_risk + subject_risk + body_risk + url_risk + intel_risk
    return max(0, min(100, total_risk))

# ── Calculate URL Risk ─────────────────────────────────────────────────────

def calculate_url_risk(analysis: UrlAnalysis, intel: ThreatIntel) -> float:
    """Calculate risk score for URL"""
    weights = {
        "domainAge": 0.20,
        "sslCertificate": 0.15,
        "ipReputation": 0.25,
        "suspicionScore": 0.25,
        "threatIntel": 0.15
    }
    
    domain_risk = calculate_domain_age_risk(analysis.domainAge) * weights["domainAge"]
    ssl_risk = 0 if analysis.sslCertificate else 100 * weights["sslCertificate"]
    ip_risk = (100 - analysis.ipReputation) * weights["ipReputation"]
    suspicion_risk = analysis.suspicionScore * weights["suspicionScore"]
    intel_risk = calculate_threat_intel_risk(intel) * weights["threatIntel"]
    
    total_risk = domain_risk + ssl_risk + ip_risk + suspicion_risk + intel_risk
    return max(0, min(100, total_risk))

# ── Calculate Threat Intel Risk ───────────────────────────────────────────

def calculate_threat_intel_risk(intel: ThreatIntel) -> float:
    """Calculate risk from threat intelligence"""
    risk = 0
    
    vt = intel.virusTotal
    if vt:
        total = vt.get("malicious", 0) + vt.get("suspicious", 0) + vt.get("harmless", 0)
        if total > 0:
            risk += (vt.get("malicious", 0) / total) * 100
            risk += (vt.get("suspicious", 0) / total) * 50
    
    if intel.googleSafeBrowsing.get("isMalicious"):
        risk += 40
    
    risk += intel.abuseIPDB.get("abuseConfidenceScore", 0) * 0.5
    
    return min(100, risk)

# ── Calculate Domain Age Risk ─────────────────────────────────────────────

def calculate_domain_age_risk(age_days: int) -> float:
    """Calculate risk based on domain age"""
    if age_days <= 7:
        return 90
    elif age_days <= 30:
        return 70
    elif age_days <= 90:
        return 50
    elif age_days <= 180:
        return 30
    elif age_days <= 365:
        return 15
    else:
        return 5

# ── Determine Threat Level ───────────────────────────────────────────────

def determine_threat_level(risk_score: float) -> str:
    """Determine threat level based on risk score"""
    if risk_score >= 80:
        return "critical"
    elif risk_score >= 60:
        return "high"
    elif risk_score >= 40:
        return "medium"
    else:
        return "low"

# ── Main ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)
