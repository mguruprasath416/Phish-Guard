#!/usr/bin/env python3
"""
Email Phishing Predictor
Main prediction logic for email analysis
"""

import torch
from typing import Dict, Any
import re
from .load_model import model_loader

class EmailPredictor:
    """Email phishing prediction class"""
    
    def __init__(self):
        self.model = model_loader.get_model()
        self.tokenizer = model_loader.get_tokenizer()
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.max_length = 512
    
    def predict(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict phishing indicators for an email
        
        Args:
            email_data: Dictionary containing sender, subject, body, attachments
            
        Returns:
            Dictionary with analysis results
        """
        try:
            # Combine subject and body for analysis
            text = email_data.get('subject', '') + ' ' + email_data.get('body', '')
            
            # Extract features
            sender_reputation = self._analyze_sender(email_data.get('sender', ''))
            subject_suspicion = self._analyze_subject(email_data.get('subject', ''))
            body_suspicion = self._analyze_body(email_data.get('body', ''))
            url_count = self._count_urls(email_data.get('body', ''))
            attachment_count = len(email_data.get('attachments', []))
            
            # Use AI model for prediction
            ai_prediction = self._ai_predict(text)
            
            # Combine AI prediction with rule-based analysis
            confidence = self._calculate_confidence(ai_prediction, subject_suspicion, body_suspicion)
            
            return {
                'senderReputation': sender_reputation,
                'subjectSuspicion': subject_suspicion,
                'bodySuspicion': body_suspicion,
                'urlCount': url_count,
                'attachmentCount': attachment_count,
                'method': 'ai',
                'confidence': confidence
            }
            
        except Exception as e:
            # Fallback to rule-based analysis
            return self._fallback_analysis(email_data)
    
    def _ai_predict(self, text: str) -> float:
        """
        Use AI model to predict phishing probability
        
        Args:
            text: Email text to analyze
            
        Returns:
            Phishing probability (0-1)
        """
        try:
            # Tokenize
            inputs = self.tokenizer(
                text,
                truncation=True,
                max_length=self.max_length,
                padding=True,
                return_tensors='pt'
            ).to(self.device)
            
            # Predict
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=-1)
                phishing_prob = probabilities[0][1].item()
            
            return phishing_prob
            
        except Exception as e:
            print(f"AI prediction error: {e}")
            return 0.5
    
    def _analyze_sender(self, sender: str) -> float:
        """Analyze sender email for reputation"""
        sender_lower = sender.lower()
        reputation = 70  # Base reputation
        
        # Check for suspicious patterns
        if '@' not in sender or '..' in sender:
            reputation -= 30
        
        suspicious_domains = ['secure', 'verify', 'account', 'update']
        for domain in suspicious_domains:
            if domain in sender_lower:
                reputation -= 15
        
        return max(0, min(100, reputation))
    
    def _analyze_subject(self, subject: str) -> float:
        """Analyze email subject for suspicion"""
        subject_lower = subject.lower()
        suspicion = 0
        
        urgency_words = ['urgent', 'immediate', 'action required', 'important']
        phishing_words = ['verify', 'account', 'suspended', 'confirm', 'security']
        
        for word in urgency_words:
            if word in subject_lower:
                suspicion += 15
        
        for word in phishing_words:
            if word in subject_lower:
                suspicion += 10
        
        return min(100, suspicion)
    
    def _analyze_body(self, body: str) -> float:
        """Analyze email body for suspicion"""
        body_lower = body.lower()
        suspicion = 0
        
        suspicious_patterns = [
            'verify your account',
            'confirm your identity',
            'update your information',
            'click here',
            'login to continue'
        ]
        
        for pattern in suspicious_patterns:
            if pattern in body_lower:
                suspicion += 15
        
        # Check for personal information requests
        if any(x in body_lower for x in ['ssn', 'credit card', 'password']):
            suspicion += 20
        
        return min(100, suspicion)
    
    def _count_urls(self, text: str) -> int:
        """Count URLs in text"""
        urls = re.findall(r'(https?://[^\s]+)', text)
        return len(urls)
    
    def _calculate_confidence(self, ai_prediction: float, subject_suspicion: float, body_suspicion: float) -> float:
        """Calculate overall confidence score"""
        # Weight AI prediction higher
        confidence = (ai_prediction * 0.6) + ((subject_suspicion + body_suspicion) / 200 * 0.4)
        return max(0, min(100, confidence * 100))
    
    def _fallback_analysis(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based analysis"""
        sender_reputation = self._analyze_sender(email_data.get('sender', ''))
        subject_suspicion = self._analyze_subject(email_data.get('subject', ''))
        body_suspicion = self._analyze_body(email_data.get('body', ''))
        url_count = self._count_urls(email_data.get('body', ''))
        attachment_count = len(email_data.get('attachments', []))
        
        confidence = 100 - ((subject_suspicion + body_suspicion) / 2)
        
        return {
            'senderReputation': sender_reputation,
            'subjectSuspicion': subject_suspicion,
            'bodySuspicion': body_suspicion,
            'urlCount': url_count,
            'attachmentCount': attachment_count,
            'method': 'fallback',
            'confidence': confidence
        }
