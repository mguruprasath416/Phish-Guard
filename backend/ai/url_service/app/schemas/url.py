#!/usr/bin/env python3
"""
URL Schemas
Pydantic schemas for URL data validation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class URLRequest(BaseModel):
    """URL analysis request schema"""
    url: str = Field(..., description="URL to analyze")
    
    @validator('url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        if len(v) > 2048:
            raise ValueError('URL too long')
        return v.strip()

class URLAnalysis(BaseModel):
    """URL analysis result schema"""
    domainAge: int = Field(..., ge=0, description="Domain age in days")
    sslCertificate: bool = Field(..., description="SSL certificate status")
    ipReputation: float = Field(..., ge=0, le=100, description="IP reputation score")
    suspicionScore: float = Field(..., ge=0, le=100, description="Suspicion score")
    method: str = Field(..., description="Analysis method used")
    confidence: float = Field(..., ge=0, le=100, description="Overall confidence score")

class URLAnalysisResponse(BaseModel):
    """URL analysis response schema"""
    success: bool = Field(..., description="Whether the analysis was successful")
    analysis: URLAnalysis = Field(..., description="Analysis results")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Analysis timestamp")
