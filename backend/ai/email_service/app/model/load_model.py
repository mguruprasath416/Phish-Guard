#!/usr/bin/env python3
"""
Model Loading Utility
Handles loading and caching of trained models
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
from typing import Optional

class ModelLoader:
    """Singleton class for loading and caching models"""
    
    _instance = None
    _model = None
    _tokenizer = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance
    
    def load_model(self, model_path: Optional[str] = None):
        """
        Load the trained model
        
        Args:
            model_path: Path to the trained model directory
                      If None, uses default path
        """
        if self._model is not None:
            return self._model
        
        if model_path is None:
            model_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                'trained_models',
                'deberta-v3-phishguard'
            )
        
        # Check if model exists
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        # Load model
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self._model = AutoModelForSequenceClassification.from_pretrained(
            model_path,
            num_labels=2
        ).to(device)
        
        self._model.eval()
        
        return self._model
    
    def load_tokenizer(self, model_path: Optional[str] = None):
        """
        Load the tokenizer
        
        Args:
            model_path: Path to the trained model directory
                      If None, uses default path
        """
        if self._tokenizer is not None:
            return self._tokenizer
        
        if model_path is None:
            model_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                'trained_models',
                'deberta-v3-phishguard'
            )
        
        # Check if tokenizer exists
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Tokenizer not found at {model_path}")
        
        # Load tokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(model_path)
        
        return self._tokenizer
    
    def get_model(self):
        """Get the cached model or load it"""
        if self._model is None:
            return self.load_model()
        return self._model
    
    def get_tokenizer(self):
        """Get the cached tokenizer or load it"""
        if self._tokenizer is None:
            return self.load_tokenizer()
        return self._tokenizer

# Global instance
model_loader = ModelLoader()
