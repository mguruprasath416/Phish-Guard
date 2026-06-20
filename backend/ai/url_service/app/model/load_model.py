#!/usr/bin/env python3
"""
Model Loading Utility
Handles loading and caching of trained URL models
"""

import joblib
import os
from typing import Optional
import numpy as np

class URLModelLoader:
    """Singleton class for loading and caching URL models"""
    
    _instance = None
    _model = None
    _scaler = None
    _feature_names = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(URLModelLoader, cls).__new__(cls)
        return cls._instance
    
    def load_model(self, model_path: Optional[str] = None):
        """
        Load the trained model
        
        Args:
            model_path: Path to the trained model file
                      If None, uses default path
        """
        if self._model is not None:
            return self._model
        
        if model_path is None:
            model_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                'trained_models',
                'url_phishing_model.pkl'
            )
        
        # Check if model exists
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        # Load model
        self._model = joblib.load(model_path)
        
        return self._model
    
    def load_scaler(self, scaler_path: Optional[str] = None):
        """
        Load the feature scaler
        
        Args:
            scaler_path: Path to the scaler file
                        If None, uses default path
        """
        if self._scaler is not None:
            return self._scaler
        
        if scaler_path is None:
            scaler_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                'trained_models',
                'feature_scaler.pkl'
            )
        
        # Check if scaler exists
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler not found at {scaler_path}")
        
        # Load scaler
        self._scaler = joblib.load(scaler_path)
        
        return self._scaler
    
    def load_feature_names(self, names_path: Optional[str] = None):
        """
        Load feature names
        
        Args:
            names_path: Path to the feature names JSON file
                      If None, uses default path
        """
        if self._feature_names is not None:
            return self._feature_names
        
        if names_path is None:
            names_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                'trained_models',
                'feature_names.json'
            )
        
        # Check if file exists
        if not os.path.exists(names_path):
            raise FileNotFoundError(f"Feature names not found at {names_path}")
        
        # Load feature names
        import json
        with open(names_path, 'r') as f:
            self._feature_names = json.load(f)
        
        return self._feature_names
    
    def get_model(self):
        """Get the cached model or load it"""
        if self._model is None:
            return self.load_model()
        return self._model
    
    def get_scaler(self):
        """Get the cached scaler or load it"""
        if self._scaler is None:
            return self.load_scaler()
        return self._scaler
    
    def get_feature_names(self):
        """Get the cached feature names or load them"""
        if self._feature_names is None:
            return self.load_feature_names()
        return self._feature_names

# Global instance
model_loader = URLModelLoader()
