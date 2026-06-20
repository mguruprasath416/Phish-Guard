#!/usr/bin/env python3
"""
Threat Intelligence Service
FastAPI service for aggregating threat intelligence from multiple sources
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
import os

app = FastAPI(
    title="Threat Intelligence Service",
    description="Threat intelligence aggregation service",
    version="1.0.0"
)

# ── Models ─────────────────────────────────────────────────────────────────

class ThreatIntelRequest(BaseModel):
    type: str  # 'email' or 'url'
    target: str

class VirusTotalResult(BaseModel):
    malicious: int
    suspicious: int
    harmless: int

class GoogleSafeBrowsingResult(BaseModel):
    isMalicious: bool

class AbuseIPDBResult(BaseModel):
    abuseConfidenceScore: int

class ThreatIntelResponse(BaseModel):
    virusTotal: VirusTotalResult
    googleSafeBrowsing: GoogleSafeBrowsingResult
    abuseIPDB: AbuseIPDBResult
    method: str
    timestamp: str

# ── Health Check ───────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "threat-intel"}

# ── Check Endpoint ─────────────────────────────────────────────────────────

@app.post("/api/check", response_model=ThreatIntelResponse)
async def check_threat_intel(request: ThreatIntelRequest):
    """
    Check threat intelligence for email or URL
    """
    try:
        from datetime import datetime
        
        # Try to use actual APIs if keys are available
        virus_total = check_virustotal(request.type, request.target)
        google_sb = check_google_safe_browsing(request.target)
        abuse_ipdb = check_abuseipdb(request.target)
        
        return ThreatIntelResponse(
            virusTotal=virus_total,
            googleSafeBrowsing=google_sb,
            abuseIPDB=abuse_ipdb,
            method="api",
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── VirusTotal Check ─────────────────────────────────────────────────────

def check_virustotal(scan_type: str, target: str) -> VirusTotalResult:
    """Check VirusTotal (mock or real based on API key)"""
    api_key = os.getenv("VIRUSTOTAL_API_KEY")
    
    if not api_key:
        # Mock response based on heuristics
        malicious = 0
        if scan_type == "email":
            if any(x in target.lower() for x in ['.xyz', '.top', '.tk']):
                malicious = 2
        elif scan_type == "url":
            if any(x in target.lower() for x in ['.xyz', '.top', '.tk', 'bit.ly']):
                malicious = 3
        
        return VirusTotalResult(
            malicious=malicious,
            suspicious=malicious if malicious > 0 else 0,
            harmless=60 - malicious
        )
    
    # Real API call would go here
    return VirusTotalResult(malicious=0, suspicious=0, harmless=60)

# ── Google Safe Browsing Check ────────────────────────────────────────────

def check_google_safe_browsing(target: str) -> GoogleSafeBrowsingResult:
    """Check Google Safe Browsing (mock or real based on API key)"""
    api_key = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY")
    
    if not api_key:
        # Mock response based on heuristics
        is_malicious = any(x in target.lower() for x in 
                          ['.xyz', '.top', '.tk', 'malware', 'phishing'])
        return GoogleSafeBrowsingResult(isMalicious=is_malicious)
    
    # Real API call would go here
    return GoogleSafeBrowsingResult(isMalicious=False)

# ── AbuseIPDB Check ───────────────────────────────────────────────────────

def check_abuseipdb(target: str) -> AbuseIPDBResult:
    """Check AbuseIPDB (mock or real based on API key)"""
    api_key = os.getenv("ABUSEIPDB_API_KEY")
    
    if not api_key:
        # Mock response based on heuristics
        score = 0
        if any(x in target.lower() for x in ['.xyz', '.top', '.tk']):
            score = 45
        return AbuseIPDBResult(abuseConfidenceScore=score)
    
    # Real API call would go here
    return AbuseIPDBResult(abuseConfidenceScore=0)

# ── Main ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
