#!/usr/bin/env python3
"""
Ensemble Risk Calculation
Combines multiple risk factors using ensemble methods
"""

from typing import Dict, List, Optional
import numpy as np

class RiskEnsemble:
    """Ensemble risk calculation class"""
    
    def __init__(self):
        self.weights = {
            'email': {
                'sender_reputation': 0.25,
                'subject_suspicion': 0.20,
                'body_suspicion': 0.25,
                'url_count': 0.10,
                'threat_intel': 0.20
            },
            'url': {
                'domain_age': 0.20,
                'ssl_certificate': 0.15,
                'ip_reputation': 0.25,
                'suspicion_score': 0.25,
                'threat_intel': 0.15
            }
        }
    
    def calculate_email_risk(self, analysis: Dict, threat_intel: Dict) -> float:
        """
        Calculate risk score for email using ensemble method
        
        Args:
            analysis: Email analysis results
            threat_intel: Threat intelligence data
            
        Returns:
            Risk score (0-100)
        """
        weights = self.weights['email']
        
        # Calculate individual risk components
        sender_risk = (100 - analysis.get('senderReputation', 70)) * weights['sender_reputation']
        subject_risk = analysis.get('subjectSuspicion', 0) * weights['subject_suspicion']
        body_risk = analysis.get('bodySuspicion', 0) * weights['body_suspicion']
        url_risk = min(analysis.get('urlCount', 0) * 10, 100) * weights['url_count']
        intel_risk = self._calculate_threat_intel_risk(threat_intel) * weights['threat_intel']
        
        # Ensemble combination
        total_risk = sender_risk + subject_risk + body_risk + url_risk + intel_risk
        
        return max(0, min(100, total_risk))
    
    def calculate_url_risk(self, analysis: Dict, threat_intel: Dict) -> float:
        """
        Calculate risk score for URL using ensemble method
        
        Args:
            analysis: URL analysis results
            threat_intel: Threat intelligence data
            
        Returns:
            Risk score (0-100)
        """
        weights = self.weights['url']
        
        # Calculate individual risk components
        domain_risk = self._calculate_domain_age_risk(analysis.get('domainAge', 365)) * weights['domain_age']
        ssl_risk = 0 if analysis.get('sslCertificate', False) else 100 * weights['ssl_certificate']
        ip_risk = (100 - analysis.get('ipReputation', 70)) * weights['ip_reputation']
        suspicion_risk = analysis.get('suspicionScore', 0) * weights['suspicion_score']
        intel_risk = self._calculate_threat_intel_risk(threat_intel) * weights['threat_intel']
        
        # Ensemble combination
        total_risk = domain_risk + ssl_risk + ip_risk + suspicion_risk + intel_risk
        
        return max(0, min(100, total_risk))
    
    def weighted_average(self, scores: List[float], weights: List[float]) -> float:
        """
        Calculate weighted average of scores
        
        Args:
            scores: List of scores
            weights: List of weights (must sum to 1)
            
        Returns:
            Weighted average
        """
        if len(scores) != len(weights):
            raise ValueError("Scores and weights must have same length")
        
        if abs(sum(weights) - 1.0) > 0.01:
            raise ValueError("Weights must sum to 1")
        
        return sum(s * w for s, w in zip(scores, weights))
    
    def majority_vote(self, predictions: List[int]) -> int:
        """
        Majority vote ensemble method
        
        Args:
            predictions: List of binary predictions (0 or 1)
            
        Returns:
            Majority prediction
        """
        return int(np.mean(predictions) >= 0.5)
    
    def stacking_ensemble(self, base_predictions: Dict[str, float], meta_weights: Dict[str, float]) -> float:
        """
        Stacking ensemble with meta-learner weights
        
        Args:
            base_predictions: Dictionary of base model predictions
            meta_weights: Dictionary of meta-learner weights
            
        Returns:
            Final prediction
        """
        weighted_sum = sum(
            base_predictions[model] * meta_weights.get(model, 0)
            for model in base_predictions
        )
        
        return weighted_sum
    
    def _calculate_threat_intel_risk(self, threat_intel: Dict) -> float:
        """Calculate risk from threat intelligence"""
        risk = 0
        
        vt = threat_intel.get('virusTotal', {})
        if vt:
            total = vt.get('malicious', 0) + vt.get('suspicious', 0) + vt.get('harmless', 0)
            if total > 0:
                risk += (vt.get('malicious', 0) / total) * 100
                risk += (vt.get('suspicious', 0) / total) * 50
        
        if threat_intel.get('googleSafeBrowsing', {}).get('isMalicious'):
            risk += 40
        
        risk += threat_intel.get('abuseIPDB', {}).get('abuseConfidenceScore', 0) * 0.5
        
        return min(100, risk)
    
    def _calculate_domain_age_risk(self, age_days: int) -> float:
        """Calculate risk based on domain age"""
        if age_days <= 7:
            return 90
        elif age_days <= 30:
            return 70
        elif age_days <= 90:
            return 50
        elif age_days <= 180:
            return 30
        elif age_days <= 365:
            return 15
        else:
            return 5
    
    def adaptive_weighting(self, historical_performance: Dict[str, float]) -> Dict[str, float]:
        """
        Adaptively adjust weights based on historical performance
        
        Args:
            historical_performance: Dictionary of model performance metrics
            
        Returns:
            Adjusted weights
        """
        # Normalize performance to sum to 1
        total = sum(historical_performance.values())
        if total == 0:
            return self.weights.copy()
        
        return {
            model: perf / total
            for model, perf in historical_performance.items()
        }
