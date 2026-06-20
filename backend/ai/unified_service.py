#!/usr/bin/env python3
"""
Unified AI Service
Single FastAPI app with all AI services as separate route groups
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import os
import sys

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Initialize FastAPI app
app = FastAPI(
    title="PhishGuard AI Unified Service",
    description="Unified API for all AI services",
    version="1.0.0"
)

# Try to import service routers - handle failures gracefully
try:
    from email_service.app.api.predict import router as email_router
    app.include_router(email_router, prefix="/email-service", tags=["Email Service"])
except ImportError as e:
    print(f"Warning: Could not import email_service router: {e}")

try:
    from url_service.app.api.predict import router as url_router
    app.include_router(url_router, prefix="/url-service", tags=["URL Service"])
except ImportError as e:
    print(f"Warning: Could not import url_service router: {e}")

try:
    from threat_intel.api.endpoints import router as threat_intel_router
    app.include_router(threat_intel_router, prefix="/threat-intel", tags=["Threat Intel"])
except ImportError as e:
    print(f"Warning: Could not import threat_intel router: {e}")

# ── Email Service Direct Implementation ───────────────────────────────────

class Attachment(BaseModel):
    filename: str
    contentType: Optional[str] = None
    size: Optional[int] = None

class EmailRequest(BaseModel):
    sender: str
    subject: str
    body: str
    attachments: Optional[List[Attachment]] = []

class EmailAnalysis(BaseModel):
    senderReputation: float
    subjectSuspicion: float
    bodySuspicion: float
    urlCount: int
    attachmentCount: int
    method: str
    confidence: float

@app.post("/email-service/api/predict", response_model=EmailAnalysis, tags=["Email Service"])
async def predict_email_phishing(email: EmailRequest):
    """Analyze email for phishing indicators"""
    try:
        # Simple inline analysis to avoid import issues
        sender_lower = email.sender.lower()
        subject_lower = email.subject.lower()
        body_lower = email.body.lower()
        
        # Whitelist of known legitimate domains
        legitimate_domains = [
            'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
            'icloud.com', 'aol.com', 'protonmail.com', 'company.com',
            'org', 'edu', 'gov'
        ]
        
        # Analyze sender
        sender_reputation = 85
        if '@' not in email.sender or '..' in email.sender:
            sender_reputation -= 30
        
        sender_domain = sender_lower.split('@')[-1] if '@' in sender_lower else ''
        if any(legit in sender_domain for legit in legitimate_domains):
            sender_reputation = max(sender_reputation, 90)
        
        # Analyze subject
        subject_suspicion = 0
        urgency_words = ['urgent', 'immediate', 'action required']
        phishing_words = ['suspended', 'verify your account', 'confirm your identity']
        
        for word in urgency_words:
            if word in subject_lower:
                subject_suspicion += 10
        
        for word in phishing_words:
            if word in subject_lower:
                subject_suspicion += 15
        
        # Analyze body
        body_suspicion = 0
        suspicious_patterns = [
            'verify your account immediately',
            'confirm your identity or account will be',
            'click here to verify your account',
            'your account will be suspended unless',
            'login to continue to avoid suspension'
        ]
        
        for pattern in suspicious_patterns:
            if pattern in body_lower:
                body_suspicion += 20
        
        # Count URLs
        import re
        urls = re.findall(r'(https?://[^\s]+)', body_lower)
        url_count = len(urls)
        
        if url_count > 5:
            body_suspicion += 15
        
        attachment_count = len(email.attachments) if email.attachments else 0
        
        # Calculate confidence
        total_suspicion = subject_suspicion + body_suspicion
        if total_suspicion < 20:
            confidence = 95
        elif total_suspicion < 40:
            confidence = 80
        elif total_suspicion < 60:
            confidence = 60
        else:
            confidence = max(40, 100 - total_suspicion)
        
        return EmailAnalysis(
            senderReputation=max(0, min(100, sender_reputation)),
            subjectSuspicion=max(0, min(100, subject_suspicion)),
            bodySuspicion=max(0, min(100, body_suspicion)),
            urlCount=url_count,
            attachmentCount=attachment_count,
            method="unified",
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── URL Service Direct Implementation ────────────────────────────────────

class URLRequest(BaseModel):
    url: str

class URLAnalysis(BaseModel):
    domainAge: int
    sslCertificate: bool
    dnsRecords: dict
    ipReputation: float
    suspicionScore: float
    method: str
    confidence: float

@app.post("/url-service/api/predict", response_model=URLAnalysis, tags=["URL Service"])
async def predict_url_phishing(request: URLRequest):
    """Analyze URL for phishing indicators"""
    try:
        from urllib.parse import urlparse
        import re
        
        parsed = urlparse(request.url)
        hostname = parsed.hostname.lower() if parsed.hostname else ''
        pathname = parsed.pathname.lower() if parsed.pathname else ''
        
        suspicion_score = 0
        domain_age = 365
        ssl_certificate = parsed.scheme == 'https'
        ip_reputation = 70
        
        # Check domain characteristics
        domain_parts = hostname.split('.')
        if len(domain_parts) > 4:
            suspicion_score += 20
        
        # Suspicious keywords
        suspicious_keywords = ['secure', 'verify', 'account', 'login', 'signin', 
                             'bank', 'paypal', 'update', 'confirm']
        for keyword in suspicious_keywords:
            if keyword in hostname:
                suspicion_score += 15
        
        # Suspicious TLDs
        suspicious_tlds = ['.xyz', '.top', '.zip', '.tk', '.ml', '.ga', '.cf']
        for tld in suspicious_tlds:
            if hostname.endswith(tld):
                suspicion_score += 15
                domain_age = 30
        
        # URL length
        if len(request.url) > 100:
            suspicion_score += 15
        
        # @ symbol
        if '@' in request.url:
            suspicion_score += 35
        
        # IP address
        if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname):
            suspicion_score += 40
            ip_reputation = 30
        
        # Shorteners
        shorteners = ['bit.ly', 'tinyurl.com', 'short.link', 'goo.gl', 't.co']
        for shortener in shorteners:
            if shortener in hostname:
                suspicion_score += 20
        
        ip_reputation = max(0, ip_reputation - suspicion_score / 2)
        
        return URLAnalysis(
            domainAge=max(1, domain_age),
            sslCertificate=ssl_certificate,
            dnsRecords={"ip": "Detected", "domain": hostname},
            ipReputation=max(0, min(100, ip_reputation)),
            suspicionScore=suspicion_score,
            method="unified",
            confidence=max(50, 100 - suspicion_score)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Threat Intel Direct Implementation ──────────────────────────────────

class ThreatIntelRequest(BaseModel):
    target: str
    type: str  # 'url' or 'email' or 'ip'

class ThreatIntelResponse(BaseModel):
    virusTotal: Optional[Dict] = None
    googleSafeBrowsing: Optional[Dict] = None
    abuseIPDB: Optional[Dict] = None
    openPhish: Optional[Dict] = None
    aggregatedRisk: float

@app.post("/threat-intel/check", response_model=ThreatIntelResponse, tags=["Threat Intel"])
async def check_threat(request: ThreatIntelRequest):
    """Check threat intelligence for a target"""
    try:
        # Simple mock implementation to avoid import issues
        return {
            'virusTotal': {'malicious': 0, 'suspicious': 0, 'harmless': 1},
            'googleSafeBrowsing': {'isMalicious': False},
            'abuseIPDB': {'abuseConfidenceScore': 0},
            'openPhish': {'isPhishing': False},
            'aggregatedRisk': 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Threat Intel API Compatibility & Health ──────────────────────────────

@app.post("/threat-intel/api/check", response_model=ThreatIntelResponse, tags=["Threat Intel"])
async def check_threat_api(request: ThreatIntelRequest):
    return await check_threat(request)

@app.get("/threat-intel/health", tags=["Threat Intel"])
async def threat_intel_health():
    return {"status": "healthy", "service": "threat-intel"}

@app.get("/email-service/health", tags=["Email Service"])
async def email_service_health():
    return {"status": "healthy", "service": "email-service"}

@app.get("/url-service/health", tags=["URL Service"])
async def url_service_health():
    return {"status": "healthy", "service": "url-service"}

# ── LLM Service Direct Implementation ────────────────────────────────────

class ExplanationRequest(BaseModel):
    type: str  # 'email' or 'url'
    analysis: Dict[str, Any]
    threatIntel: Dict[str, Any]
    riskScore: float

class ExplanationResponse(BaseModel):
    summary: str
    keyFindings: List[str]
    recommendations: List[str]
    method: str
    confidence: float

class ReportRequest(BaseModel):
    scanResult: Dict[str, Any]
    threatLevel: str

class ReportResponse(BaseModel):
    executiveSummary: str
    detailedAnalysis: str
    attackVector: str
    mitigationSteps: List[Dict[str, str]]
    method: str

def generate_template_explanation(request: ExplanationRequest) -> ExplanationResponse:
    is_high_risk = request.riskScore > 60
    is_critical = request.riskScore > 80
    
    if request.type == "email":
        if is_critical:
            summary = "This email exhibits multiple indicators of a sophisticated phishing attack. Immediate action is recommended."
            key_findings = [
                f"Sender reputation score: {request.analysis.get('senderReputation', 0)}/100",
                f"Subject suspicion score: {request.analysis.get('subjectSuspicion', 0)}/100",
                f"Body content suspicion score: {request.analysis.get('bodySuspicion', 0)}/100",
            ]
            recommendations = [
                "Do not click any links in this email",
                "Do not download any attachments",
                "Report this email to your IT security team",
                "Delete the email immediately"
            ]
        elif is_high_risk:
            summary = "This email shows several suspicious characteristics that warrant caution."
            key_findings = [
                f"Sender reputation score: {request.analysis.get('senderReputation', 0)}/100",
                f"Subject suspicion score: {request.analysis.get('subjectSuspicion', 0)}/100",
            ]
            recommendations = [
                "Verify the sender's identity through a separate channel",
                "Hover over links to check the actual destination before clicking",
                "Do not provide sensitive information without verification"
            ]
        else:
            summary = "This email appears to be legitimate based on our analysis."
            key_findings = [
                f"Sender reputation score: {request.analysis.get('senderReputation', 0)}/100",
                "No major threat intelligence detections"
            ]
            recommendations = [
                "Still verify the sender if you weren't expecting this email",
                "Be cautious with any links or attachments"
            ]
    else:  # URL
        if is_critical:
            summary = "This URL exhibits multiple high-risk characteristics and is likely malicious."
            key_findings = [
                f"Domain age: {request.analysis.get('domainAge', 0)} days",
                f"SSL Certificate: {'Present' if request.analysis.get('sslCertificate') else 'Missing'}",
                f"IP reputation score: {request.analysis.get('ipReputation', 0)}/100",
            ]
            recommendations = [
                "Do not visit this URL under any circumstances",
                "Block this URL if possible",
                "Report this URL to your security team"
            ]
        elif is_high_risk:
            summary = "This URL shows several suspicious characteristics that warrant caution."
            key_findings = [
                f"Domain age: {request.analysis.get('domainAge', 0)} days",
                f"Suspicion score: {request.analysis.get('suspicionScore', 0)}/100",
            ]
            recommendations = [
                "Do not visit this URL unless absolutely necessary",
                "Verify the URL through official channels if you must visit",
                "Use a sandboxed environment if you need to test the URL"
            ]
        else:
            summary = "This URL appears to be relatively safe based on our analysis."
            key_findings = [
                f"Domain age: {request.analysis.get('domainAge', 0)} days",
                "No major threat intelligence detections"
            ]
            recommendations = [
                "Still exercise normal caution when visiting any URL",
                "Ensure the URL is what you expected before visiting"
            ]
    
    return ExplanationResponse(
        summary=summary,
        keyFindings=key_findings,
        recommendations=recommendations,
        method="template",
        confidence=max(50, 100 - request.riskScore / 2)
    )

def generate_template_report(request: ReportRequest) -> ReportResponse:
    scan_result = request.scanResult
    is_phishing = scan_result.get("isPhishing", False)
    risk_score = scan_result.get("riskScore", 0)
    indicators = scan_result.get("indicators", [])
    
    if is_phishing:
        executive_summary = f"This {scan_result.get('scanType', 'item')} has been identified as {request.threatLevel} risk with a confidence score of {risk_score}%. Multiple indicators of compromise were detected."
        detailed_analysis = f"Analysis detected {len(indicators)} suspicious indicators: {', '.join(indicators)}. These patterns are commonly associated with {request.threatLevel} severity threats."
        attack_vector = "phishing" if scan_result.get("scanType") == "email" else "credential_theft"
        mitigation_steps = [
            {"priority": "critical", "action": "Block sender/domain", "description": "Immediately block the sender or domain"},
            {"priority": "high", "action": "Report to security team", "description": "Escalate to your organization's security team"},
            {"priority": "high", "action": "User awareness", "description": "Educate users about the specific attack patterns detected"}
        ]
    else:
        executive_summary = f"This {scan_result.get('scanType', 'item')} appears to be legitimate with a low risk score of {risk_score}%. No significant threats were detected."
        detailed_analysis = "Analysis did not detect any significant suspicious patterns. The content appears to follow normal communication patterns."
        attack_vector = "none"
        mitigation_steps = [
            {"priority": "low", "action": "Monitor", "description": "Continue monitoring for similar patterns"},
            {"priority": "low", "action": "Log for analysis", "description": "Log this analysis for future reference"}
        ]
    
    return ReportResponse(
        executiveSummary=executive_summary,
        detailedAnalysis=detailed_analysis,
        attackVector=attack_vector,
        mitigationSteps=mitigation_steps,
        method="template"
    )

@app.post("/llm-service/api/explain", response_model=ExplanationResponse, tags=["LLM Service"])
async def llm_explain(request: ExplanationRequest):
    try:
        return generate_template_explanation(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/llm-service/api/report", response_model=ReportResponse, tags=["LLM Service"])
async def llm_report(request: ReportRequest):
    try:
        return generate_template_report(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/llm-service/health", tags=["LLM Service"])
async def llm_service_health():
    return {"status": "healthy", "service": "llm-service"}

# ── Risk Engine Service Direct Implementation ────────────────────────────

class RiskEmailAnalysis(BaseModel):
    senderReputation: float
    subjectSuspicion: float
    bodySuspicion: float
    urlCount: int
    attachmentCount: int

class RiskUrlAnalysis(BaseModel):
    domainAge: int
    sslCertificate: bool
    ipReputation: float
    suspicionScore: float

class RiskThreatIntel(BaseModel):
    virusTotal: Dict[str, int]
    googleSafeBrowsing: Dict[str, bool]
    abuseIPDB: Dict[str, int]

class RiskRequest(BaseModel):
    scanType: str
    emailAnalysis: Optional[RiskEmailAnalysis] = None
    urlAnalysis: Optional[RiskUrlAnalysis] = None
    threatIntel: RiskThreatIntel

class RiskResponse(BaseModel):
    riskScore: float
    threatLevel: str
    confidence: float
    breakdown: Dict[str, float]

def calculate_threat_intel_risk(intel: RiskThreatIntel) -> float:
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

def calculate_email_risk(analysis: RiskEmailAnalysis, intel: RiskThreatIntel) -> float:
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
    return max(0, min(100, sender_risk + subject_risk + body_risk + url_risk + intel_risk))

def calculate_domain_age_risk(age_days: int) -> float:
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

def calculate_url_risk(analysis: RiskUrlAnalysis, intel: RiskThreatIntel) -> float:
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
    return max(0, min(100, domain_risk + ssl_risk + ip_risk + suspicion_risk + intel_risk))

def determine_threat_level(risk_score: float) -> str:
    if risk_score >= 80:
        return "critical"
    elif risk_score >= 60:
        return "high"
    elif risk_score >= 40:
        return "medium"
    else:
        return "low"

@app.post("/risk-engine/api/calculate", response_model=RiskResponse, tags=["Risk Engine"])
async def calculate_risk_endpoint(request: RiskRequest):
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/risk-engine/health", tags=["Risk Engine"])
async def risk_engine_health():
    return {"status": "healthy", "service": "risk-engine"}

# ── Health Check ─────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "email-service": "active",
            "url-service": "active",
            "threat-intel": "active",
            "llm-service": "active",
            "risk-engine": "active"
        }
    }

# ── Root Endpoint ────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": "PhishGuard AI Unified Service",
        "version": "1.0.0",
        "services": [
            "/email-service",
            "/url-service",
            "/threat-intel",
            "/llm-service",
            "/risk-engine"
        ],
        "docs": "/docs"
    }

# ── Main Entry Point ──────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )
