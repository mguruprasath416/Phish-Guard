#!/usr/bin/env python3
"""
Email AI Service - Phishing Detection
FastAPI service for email phishing detection using DeBERTa model
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import sys
import os
# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(
    title="Email AI Service",
    description="AI-powered email phishing detection service",
    version="1.0.0"
)

# ── Models ─────────────────────────────────────────────────────────────────

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

# ── Health Check ───────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "email-service"}

# ── Prediction Endpoint ─────────────────────────────────────────────────────

@app.post("/api/predict", response_model=EmailAnalysis)
async def predict_phishing(email: EmailRequest):
    """
    Analyze email for phishing indicators
    """
    try:
        # Import predictor (lazy load to avoid startup issues)
        try:
            from email_service.app.model.predictor import EmailPredictor
            predictor = EmailPredictor()
            result = predictor.predict(email.dict())
            return result
        except ImportError:
            # Fallback to rule-based analysis if model not available
            return fallback_analysis(email)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Fallback Analysis ───────────────────────────────────────────────────────

def fallback_analysis(email: EmailRequest) -> EmailAnalysis:
    """Rule-based fallback when AI model is unavailable"""
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
    sender_reputation = 85  # Start with higher base reputation
    if '@' not in email.sender or '..' in email.sender:
        sender_reputation -= 30
    
    # Check if sender domain is in whitelist
    sender_domain = sender_lower.split('@')[-1] if '@' in sender_lower else ''
    if any(legit in sender_domain for legit in legitimate_domains):
        sender_reputation = max(sender_reputation, 90)
    
    # Only penalize suspicious sender patterns if not whitelisted
    if not any(legit in sender_domain for legit in legitimate_domains):
        if any(x in sender_lower for x in ['secure', 'verify', 'account']):
            sender_reputation -= 10  # Reduced from 15
    
    # Analyze subject - more conservative
    subject_suspicion = 0
    urgency_words = ['urgent', 'immediate', 'action required']
    phishing_words = ['suspended', 'verify your account', 'confirm your identity']
    
    for word in urgency_words:
        if word in subject_lower:
            subject_suspicion += 10  # Reduced from 15
    
    for word in phishing_words:
        if word in subject_lower:
            subject_suspicion += 15  # Only for specific phrases
    
    # Remove common legitimate words from suspicion
    legitimate_phrases = ['security update', 'verify your email', 'confirm subscription']
    for phrase in legitimate_phrases:
        if phrase in subject_lower:
            subject_suspicion = max(0, subject_suspicion - 10)
    
    # Analyze body - more conservative
    body_suspicion = 0
    # Only flag more specific suspicious patterns
    suspicious_patterns = [
        'verify your account immediately',
        'confirm your identity or account will be',
        'click here to verify your account',
        'your account will be suspended unless',
        'login to continue to avoid suspension'
    ]
    
    for pattern in suspicious_patterns:
        if pattern in body_lower:
            body_suspicion += 20  # Only for specific patterns
    
    # Count URLs
    import re
    urls = re.findall(r'(https?://[^\s]+)', body_lower)
    url_count = len(urls)
    
    # Only penalize excessive URLs
    if url_count > 5:
        body_suspicion += 15  # Reduced from 20, threshold increased
    
    attachment_count = len(email.attachments) if email.attachments else 0
    
    # Calculate confidence - more conservative
    total_suspicion = subject_suspicion + body_suspicion
    if total_suspicion < 20:
        confidence = 95  # High confidence for low suspicion
    elif total_suspicion < 40:
        confidence = 80  # Moderate confidence
    elif total_suspicion < 60:
        confidence = 60  # Lower confidence
    else:
        confidence = max(40, 100 - total_suspicion)
    
    return EmailAnalysis(
        senderReputation=max(0, min(100, sender_reputation)),
        subjectSuspicion=max(0, min(100, subject_suspicion)),
        bodySuspicion=max(0, min(100, body_suspicion)),
        urlCount=url_count,
        attachmentCount=attachment_count,
        method="fallback",
        confidence=confidence
    )

# ── Main ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
