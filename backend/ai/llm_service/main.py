#!/usr/bin/env python3
"""
LLM Service
FastAPI service for generating explanations and reports using LLMs
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import os

app = FastAPI(
    title="LLM Service",
    description="LLM-powered explanation and report generation service",
    version="1.0.0"
)

# ── Models ─────────────────────────────────────────────────────────────────

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

# ── Health Check ───────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "llm-service"}

# ── Generate Explanation Endpoint ───────────────────────────────────────────

@app.post("/api/explain", response_model=ExplanationResponse)
async def generate_explanation(request: ExplanationRequest):
    """
    Generate AI-powered explanation for scan results
    """
    try:
        # Try to use actual LLM if available
        provider = os.getenv("LLM_PROVIDER", "openai")
        
        if provider == "openai" and os.getenv("OPENAI_API_KEY"):
            return generate_with_openai(request)
        elif provider == "llama" and os.getenv("LLAMA_URL"):
            return generate_with_llama(request)
        else:
            # Fallback to template-based
            return generate_template_explanation(request)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Generate Report Endpoint ───────────────────────────────────────────────

@app.post("/api/report", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """
    Generate AI-powered threat report
    """
    try:
        # Try to use actual LLM if available
        provider = os.getenv("LLM_PROVIDER", "openai")
        
        if provider == "openai" and os.getenv("OPENAI_API_KEY"):
            return generate_report_with_openai(request)
        else:
            # Fallback to template-based
            return generate_template_report(request)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Template-Based Explanation ────────────────────────────────────────────

def generate_template_explanation(request: ExplanationRequest) -> ExplanationResponse:
    """Generate explanation using templates (fallback)"""
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

# ── Template-Based Report ─────────────────────────────────────────────────

def generate_template_report(request: ReportRequest) -> ReportResponse:
    """Generate threat report using templates (fallback)"""
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

# ── OpenAI Generation (Placeholder) ───────────────────────────────────────

def generate_with_openai(request: ExplanationRequest) -> ExplanationResponse:
    """Generate explanation using OpenAI (placeholder)"""
    # In production, this would call the OpenAI API
    return generate_template_explanation(request)

def generate_report_with_openai(request: ReportRequest) -> ReportResponse:
    """Generate report using OpenAI (placeholder)"""
    # In production, this would call the OpenAI API
    return generate_template_report(request)

# ── LLaMA Generation (Placeholder) ─────────────────────────────────────────

def generate_with_llama(request: ExplanationRequest) -> ExplanationResponse:
    """Generate explanation using LLaMA (placeholder)"""
    # In production, this would call a local LLaMA instance
    return generate_template_explanation(request)

# ── Main ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
