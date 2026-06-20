#!/usr/bin/env python3
"""
Confidence Score Calculation
Calculates confidence scores for predictions
"""

from typing import Dict, List, Optional
import numpy as np

class ConfidenceCalculator:
    """Confidence score calculation class"""
    
    def __init__(self):
        self.confidence_thresholds = {
            'very_high': 0.9,
            'high': 0.75,
            'medium': 0.6,
            'low': 0.4
        }
    
    def calculate_prediction_confidence(self, prediction: float, uncertainty: float = 0.0) -> float:
        """
        Calculate confidence in a prediction
        
        Args:
            prediction: Prediction value (0-1)
            uncertainty: Uncertainty estimate (0-1)
            
        Returns:
            Confidence score (0-100)
        """
        # Base confidence from prediction
        base_confidence = abs(prediction - 0.5) * 2  # Higher when closer to 0 or 1
        
        # Adjust for uncertainty
        adjusted_confidence = base_confidence * (1 - uncertainty)
        
        return max(0, min(100, adjusted_confidence * 100))
    
    def calculate_ensemble_confidence(self, predictions: List[float]) -> float:
        """
        Calculate confidence from ensemble predictions
        
        Args:
            predictions: List of predictions from ensemble members
            
        Returns:
            Confidence score (0-100)
        """
        if not predictions:
            return 0
        
        # Calculate variance as inverse confidence
        variance = np.var(predictions)
        confidence = 1 - min(variance, 1)
        
        return max(0, min(100, confidence * 100))
    
    def calculate_agreement_confidence(self, predictions: List[int]) -> float:
        """
        Calculate confidence based on agreement among predictions
        
        Args:
            predictions: List of binary predictions (0 or 1)
            
        Returns:
            Confidence score (0-100)
        """
        if not predictions:
            return 0
        
        # Calculate agreement ratio
        agreement = max(predictions.count(0), predictions.count(1)) / len(predictions)
        
        return agreement * 100
    
    def get_confidence_level(self, confidence: float) -> str:
        """
        Get confidence level label
        
        Args:
            confidence: Confidence score (0-100)
            
        Returns:
            Confidence level label
        """
        if confidence >= self.confidence_thresholds['very_high'] * 100:
            return 'very_high'
        elif confidence >= self.confidence_thresholds['high'] * 100:
            return 'high'
        elif confidence >= self.confidence_thresholds['medium'] * 100:
            return 'medium'
        elif confidence >= self.confidence_thresholds['low'] * 100:
            return 'low'
        else:
            return 'very_low'
    
    def calibrate_confidence(self, predictions: List[float], true_labels: List[int]) -> Dict[str, float]:
        """
        Calibrate confidence scores using true labels
        
        Args:
            predictions: List of predicted probabilities
            true_labels: List of true labels (0 or 1)
            
        Returns:
            Calibration metrics
        """
        if len(predictions) != len(true_labels):
            raise ValueError("Predictions and labels must have same length")
        
        # Calculate calibration metrics
        correct = sum(
            1 for p, t in zip(predictions, true_labels)
            if (p >= 0.5 and t == 1) or (p < 0.5 and t == 0)
        )
        
        accuracy = correct / len(predictions)
        
        # Calculate confidence for correct vs incorrect predictions
        correct_confidences = [
            abs(p - 0.5) * 2 for p, t in zip(predictions, true_labels)
            if (p >= 0.5 and t == 1) or (p < 0.5 and t == 0)
        ]
        
        incorrect_confidences = [
            abs(p - 0.5) * 2 for p, t in zip(predictions, true_labels)
            if not ((p >= 0.5 and t == 1) or (p < 0.5 and t == 0))
        ]
        
        avg_correct_confidence = np.mean(correct_confidences) if correct_confidences else 0
        avg_incorrect_confidence = np.mean(incorrect_confidences) if incorrect_confidences else 0
        
        return {
            'accuracy': accuracy,
            'avg_correct_confidence': avg_correct_confidence,
            'avg_incorrect_confidence': avg_incorrect_confidence,
            'calibration_factor': avg_correct_confidence - avg_incorrect_confidence
        }
    
    def bootstrap_confidence(self, predictions: List[float], n_bootstrap: int = 1000) -> Dict[str, float]:
        """
        Calculate confidence intervals using bootstrap
        
        Args:
            predictions: List of predictions
            n_bootstrap: Number of bootstrap samples
            
        Returns:
            Confidence interval statistics
        """
        if not predictions:
            return {'mean': 0, 'std': 0, 'ci_lower': 0, 'ci_upper': 0}
        
        bootstrap_means = []
        for _ in range(n_bootstrap):
            sample = np.random.choice(predictions, size=len(predictions), replace=True)
            bootstrap_means.append(np.mean(sample))
        
        mean = np.mean(bootstrap_means)
        std = np.std(bootstrap_means)
        ci_lower = np.percentile(bootstrap_means, 2.5)
        ci_upper = np.percentile(bootstrap_means, 97.5)
        
        return {
            'mean': mean,
            'std': std,
            'ci_lower': ci_lower,
            'ci_upper': ci_upper
        }
