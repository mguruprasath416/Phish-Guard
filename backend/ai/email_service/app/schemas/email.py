#!/usr/bin/env python3
"""
Email Schemas
Pydantic schemas for email data validation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class Attachment(BaseModel):
    """Attachment schema"""
    filename: str = Field(..., description="Attachment filename")
    contentType: Optional[str] = Field(None, description="MIME type of the attachment")
    size: Optional[int] = Field(None, description="Size in bytes")

class EmailRequest(BaseModel):
    """Email analysis request schema"""
    sender: str = Field(..., description="Sender email address")
    subject: str = Field(..., description="Email subject line")
    body: str = Field(..., description="Email body content")
    attachments: Optional[List[Attachment]] = Field(default_factory=list, description="List of attachments")
    
    @validator('sender')
    def validate_sender(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email address')
        return v.lower()
    
    @validator('subject')
    def validate_subject(cls, v):
        if len(v) > 500:
            raise ValueError('Subject too long')
        return v.strip()
    
    @validator('body')
    def validate_body(cls, v):
        if len(v) > 100000:
            raise ValueError('Body too long')
        return v.strip()

class EmailAnalysis(BaseModel):
    """Email analysis result schema"""
    senderReputation: float = Field(..., ge=0, le=100, description="Sender reputation score")
    subjectSuspicion: float = Field(..., ge=0, le=100, description="Subject suspicion score")
    bodySuspicion: float = Field(..., ge=0, le=100, description="Body suspicion score")
    urlCount: int = Field(..., ge=0, description="Number of URLs found")
    attachmentCount: int = Field(..., ge=0, description="Number of attachments")
    method: str = Field(..., description="Analysis method used")
    confidence: float = Field(..., ge=0, le=100, description="Overall confidence score")

class EmailAnalysisResponse(BaseModel):
    """Email analysis response schema"""
    success: bool = Field(..., description="Whether the analysis was successful")
    analysis: EmailAnalysis = Field(..., description="Analysis results")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Analysis timestamp")
