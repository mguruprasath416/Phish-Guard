#!/usr/bin/env python3
"""
URL AI Service - Phishing Detection
FastAPI service for URL phishing detection using ML models
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

import uvicorn
import sys
import os
from urllib.parse import urlparse

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(
    title="URL AI Service",
    description="AI-powered URL phishing detection service",
    version="1.0.0"
)

# ── Models ─────────────────────────────────────────────────────────────────

class UrlRequest(BaseModel):
    url: str

class UrlAnalysis(BaseModel):
    domainAge: int
    sslCertificate: bool
    dnsRecords: dict
    ipReputation: float
    suspicionScore: float
    method: str
    confidence: float

# ── Health Check ───────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "url-service"}

# ── Prediction Endpoint ─────────────────────────────────────────────────────

@app.post("/api/predict", response_model=UrlAnalysis)
async def predict_phishing(request: UrlRequest):
    """
    Analyze URL for phishing indicators
    """
    try:
        # Validate URL
        try:
            parsed = urlparse(request.url)
            if not parsed.scheme or not parsed.netloc:
                raise ValueError("Invalid URL")
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid URL format")
        
        # Try ML predictor
        try:
            from url_service.app.model.predictor import URLPredictor
            predictor = UrlPredictor()
            result = predictor.predict(request.url)
            return result
        except ImportError:
            # Fallback to rule-based analysis
            return fallback_analysis(request.url)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Fallback Analysis ───────────────────────────────────────────────────────

def fallback_analysis(url: str) -> UrlAnalysis:
    """Rule-based fallback when AI model is unavailable"""
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname.lower()
        pathname = parsed.pathname.lower()
    except:
        return UrlAnalysis(
            domainAge=0,
            sslCertificate=False,
            dnsRecords={"error": "Invalid URL"},
            ipReputation=0,
            suspicionScore=100,
            method="fallback",
            confidence=0
        )
    
    suspicion_score = 0
    domain_age = 365  # Default
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
    if len(url) > 100:
        suspicion_score += 15
    
    # @ symbol (credential theft)
    if '@' in url:
        suspicion_score += 35
    
    # IP address
    import re
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname):
        suspicion_score += 40
        ip_reputation = 30
    
    # Shorteners
    shorteners = ['bit.ly', 'tinyurl.com', 'short.link', 'goo.gl', 't.co']
    for shortener in shorteners:
        if shortener in hostname:
            suspicion_score += 20
    
    # Calculate IP reputation
    ip_reputation = max(0, ip_reputation - suspicion_score / 2)
    
    return UrlAnalysis(
        domainAge=max(1, domain_age),
        sslCertificate=ssl_certificate,
        dnsRecords={
            "ip": "Suspicious IP detected" if ip_reputation < 50 else "No suspicious IP",
            "domain": hostname
        },
        ipReputation=max(0, min(100, ip_reputation)),
        suspicionScore=suspicion_score,
        method="fallback",
        confidence=max(50, 100 - suspicion_score)
    )

# ── Main ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
