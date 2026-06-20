#!/usr/bin/env python3
"""
Email Prediction API Endpoint
Handles email phishing prediction requests
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from email_service.app.model.predictor import EmailPredictor
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))



router = APIRouter()

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

# ── Prediction Endpoint ─────────────────────────────────────────────────────

@router.post("/predict", response_model=EmailAnalysis)
async def predict_phishing(email: EmailRequest):
    """
    Analyze email for phishing indicators
    """
    try:
        predictor = EmailPredictor()
        result = predictor.predict(email.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
