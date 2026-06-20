#!/usr/bin/env python3
"""
URL Prediction API Endpoint
Handles URL phishing prediction requests
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from url_service.app.model.predictor import URLPredictor
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

router = APIRouter()

# ── Models ─────────────────────────────────────────────────────────────────

class URLRequest(BaseModel):
    url: str

class URLAnalysis(BaseModel):
    domainAge: int
    sslCertificate: bool
    ipReputation: float
    suspicionScore: float
    method: str
    confidence: float

# ── Prediction Endpoint ─────────────────────────────────────────────────────

@router.post("/predict", response_model=URLAnalysis)
async def predict_phishing(url_request: URLRequest):
    """
    Analyze URL for phishing indicators
    """
    try:
        predictor = URLPredictor()
        result = predictor.predict(url_request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
