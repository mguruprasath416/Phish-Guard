#!/usr/bin/env python3
"""
Threat Intel API Endpoints
FastAPI endpoints for threat intelligence
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from threat_intel.clients.virustotal import VirusTotalClient
from threat_intel.clients.openphish import OpenPhishClient
from threat_intel.clients.safebrowsing import SafeBrowsingClient
from threat_intel.clients.abuseipdb import AbuseIPDBClient
from threat_intel.cache.cache_manager import cache

router = APIRouter()

# ── Models ─────────────────────────────────────────────────────────────────

class ThreatIntelRequest(BaseModel):
    """Threat intelligence request schema"""
    target: str
    type: str  # 'url' or 'email' or 'ip'

class ThreatIntelResponse(BaseModel):
    """Threat intelligence response schema"""
    virusTotal: Optional[Dict] = None
    googleSafeBrowsing: Optional[Dict] = None
    abuseIPDB: Optional[Dict] = None
    openPhish: Optional[Dict] = None
    aggregatedRisk: float

# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/check", response_model=ThreatIntelResponse)
async def check_threat(request: ThreatIntelRequest):
    """
    Check threat intelligence for a target
    """
    try:
        # Check cache first
        cache_key = f"{request.type}:{request.target}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        # Initialize clients
        vt_client = VirusTotalClient()
        gsb_client = SafeBrowsingClient()
        abuse_client = AbuseIPDBClient()
        openphish_client = OpenPhishClient()
        
        # Query all sources based on type
        results = {}
        
        if request.type == 'url':
            results['virusTotal'] = vt_client.scan_url(request.target)
            results['googleSafeBrowsing'] = gsb_client.check_url(request.target)
            results['openPhish'] = openphish_client.check_url(request.target)
            results['abuseIPDB'] = abuse_client.check_url(request.target)
        elif request.type == 'email':
            results['virusTotal'] = vt_client.scan_email(request.target)
            results['abuseIPDB'] = abuse_client.check_ip(request.target.split('@')[-1] if '@' in request.target else request.target)
        elif request.type == 'ip':
            results['virusTotal'] = vt_client.scan_url(f"http://{request.target}")
            results['abuseIPDB'] = abuse_client.check_ip(request.target)
        else:
            raise HTTPException(status_code=400, detail="Invalid type. Must be 'url', 'email', or 'ip'")
        
        # Calculate aggregated risk
        aggregated_risk = calculate_aggregated_risk(results)
        
        response = {
            'virusTotal': results.get('virusTotal'),
            'googleSafeBrowsing': results.get('googleSafeBrowsing'),
            'abuseIPDB': results.get('abuseIPDB'),
            'openPhish': results.get('openPhish'),
            'aggregatedRisk': aggregated_risk
        }
        
        # Cache result
        cache.set(cache_key, response, ttl=900)  # 15 minutes
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_cache_stats():
    """Get cache statistics"""
    return cache.get_stats()

@router.delete("/cache")
async def clear_cache():
    """Clear cache"""
    cache.clear()
    return {"message": "Cache cleared"}

def calculate_aggregated_risk(results: Dict) -> float:
    """
    Calculate aggregated risk score from multiple sources
    
    Args:
        results: Dictionary of threat intelligence results
        
    Returns:
        Aggregated risk score (0-100)
    """
    risk = 0
    
    # VirusTotal
    vt = results.get('virusTotal', {})
    if vt:
        total = vt.get('malicious', 0) + vt.get('suspicious', 0) + vt.get('harmless', 0)
        if total > 0:
            risk += (vt.get('malicious', 0) / total) * 100
            risk += (vt.get('suspicious', 0) / total) * 50
    
    # Google Safe Browsing
    gsb = results.get('googleSafeBrowsing', {})
    if gsb and gsb.get('isMalicious'):
        risk += 40
    
    # AbuseIPDB
    abuse = results.get('abuseIPDB', {})
    if abuse:
        risk += abuse.get('abuseConfidenceScore', 0) * 0.5
    
    # OpenPhish
    openphish = results.get('openPhish', {})
    if openphish and openphish.get('isPhishing'):
        risk += 35
    
    return min(100, risk)
