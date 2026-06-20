#!/usr/bin/env python3
"""
URL Phishing Predictor
Main prediction logic for URL analysis
"""

import numpy as np
from typing import Dict, Any
from urllib.parse import urlparse
import re
from .load_model import model_loader
from ..feature_extractors.url_features import extract_url_features

class URLPredictor:
    """URL phishing prediction class"""
    
    def __init__(self):
        self.model = model_loader.get_model()
        self.scaler = model_loader.get_scaler()
        self.feature_names = model_loader.get_feature_names()
    
    def predict(self, url_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict phishing indicators for a URL
        
        Args:
            url_data: Dictionary containing url
            
        Returns:
            Dictionary with analysis results
        """
        try:
            url = url_data.get('url', '')
            
            # Extract features
            features = extract_url_features(url)
            
            # Use ML model for prediction
            ml_prediction = self._ml_predict(features)
            
            # Combine with rule-based analysis
            domain_age = self._estimate_domain_age(url)
            ssl_certificate = self._check_ssl(url)
            ip_reputation = self._estimate_ip_reputation(url)
            suspicion_score = self._calculate_suspicion_score(features, ml_prediction)
            
            confidence = self._calculate_confidence(ml_prediction, suspicion_score)
            
            return {
                'domainAge': domain_age,
                'sslCertificate': ssl_certificate,
                'ipReputation': ip_reputation,
                'suspicionScore': suspicion_score,
                'method': 'ai',
                'confidence': confidence
            }
            
        except Exception as e:
            # Fallback to rule-based analysis
            return self._fallback_analysis(url_data)
    
    def _ml_predict(self, features: Dict[str, Any]) -> float:
        """
        Use ML model to predict phishing probability
        
        Args:
            features: URL feature dictionary
            
        Returns:
            Phishing probability (0-1)
        """
        try:
            # Convert features to array in correct order
            feature_array = np.array([features.get(name, 0) for name in self.feature_names])
            
            # Scale features
            scaled_features = self.scaler.transform(feature_array.reshape(1, -1))
            
            # Predict
            phishing_prob = self.model.predict_proba(scaled_features)[0][1]
            
            return phishing_prob
            
        except Exception as e:
            print(f"ML prediction error: {e}")
            return 0.5
    
    def _estimate_domain_age(self, url: str) -> int:
        """Estimate domain age in days (simplified)"""
        try:
            parsed = urlparse(url)
            domain = parsed.hostname or ''
            
            # Heuristic: newer domains with suspicious TLDs are riskier
            suspicious_tlds = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf']
            if any(domain.endswith(tld) for tld in suspicious_tlds):
                return 7  # Very new
            else:
                return 365  # Assume 1 year old
                
        except:
            return 365
    
    def _check_ssl(self, url: str) -> bool:
        """Check if URL uses HTTPS"""
        return url.startswith('https://')
    
    def _estimate_ip_reputation(self, url: str) -> float:
        """Estimate IP reputation (simplified)"""
        try:
            parsed = urlparse(url)
            hostname = parsed.hostname or ''
            
            # Check for IP address
            if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname):
                return 30  # Lower reputation for direct IP
            
            # Check for suspicious patterns
            suspicious_patterns = ['secure', 'verify', 'account', 'login']
            if any(pattern in hostname.lower() for pattern in suspicious_patterns):
                return 50
            
            return 70  # Default reputation
            
        except:
            return 70
    
    def _calculate_suspicion_score(self, features: Dict[str, Any], ml_prediction: float) -> float:
        """Calculate overall suspicion score"""
        # Combine ML prediction with feature-based scores
        suspicion = ml_prediction * 100
        
        # Adjust based on specific features
        if features.get('has_suspicious_tld', 0):
            suspicion += 20
        if features.get('is_shortener', 0):
            suspicion += 15
        if features.get('is_ip_address', 0):
            suspicion += 25
        
        return min(100, suspicion)
    
    def _calculate_confidence(self, ml_prediction: float, suspicion_score: float) -> float:
        """Calculate overall confidence score"""
        # Higher confidence when ML prediction is more certain
        confidence = abs(ml_prediction - 0.5) * 2 * 100
        
        # Adjust based on suspicion score
        confidence = (confidence + suspicion_score) / 2
        
        return max(0, min(100, confidence))
    
    def _fallback_analysis(self, url_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based analysis"""
        url = url_data.get('url', '')
        
        domain_age = self._estimate_domain_age(url)
        ssl_certificate = self._check_ssl(url)
        ip_reputation = self._estimate_ip_reputation(url)
        
        # Simple heuristic
        suspicion_score = 0
        if not ssl_certificate:
            suspicion_score += 30
        if domain_age < 30:
            suspicion_score += 20
        
        confidence = 100 - suspicion_score
        
        return {
            'domainAge': domain_age,
            'sslCertificate': ssl_certificate,
            'ipReputation': ip_reputation,
            'suspicionScore': suspicion_score,
            'method': 'fallback',
            'confidence': confidence
        }
