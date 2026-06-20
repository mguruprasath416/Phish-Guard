#!/usr/bin/env python3
"""
Tokenizer Utility
Handles text tokenization for the email service
"""

from transformers import AutoTokenizer
import os
from typing import List, Dict, Optional
from .load_model import model_loader

class EmailTokenizer:
    """Email text tokenizer class"""
    
    def __init__(self):
        self.tokenizer = model_loader.get_tokenizer()
        self.max_length = 512
    
    def tokenize(self, text: str, return_tensors: str = 'pt') -> Dict:
        """
        Tokenize email text
        
        Args:
            text: Text to tokenize
            return_tensors: Format to return tensors ('pt', 'np', or None)
            
        Returns:
            Dictionary with tokenized inputs
        """
        return self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_length,
            padding=True,
            return_tensors=return_tensors
        )
    
    def tokenize_batch(self, texts: List[str], return_tensors: str = 'pt') -> Dict:
        """
        Tokenize a batch of texts
        
        Args:
            texts: List of texts to tokenize
            return_tensors: Format to return tensors
            
        Returns:
            Dictionary with tokenized inputs
        """
        return self.tokenizer(
            texts,
            truncation=True,
            max_length=self.max_length,
            padding=True,
            return_tensors=return_tensors
        )
    
    def decode(self, token_ids: List[int]) -> str:
        """
        Decode token IDs back to text
        
        Args:
            token_ids: List of token IDs
            
        Returns:
            Decoded text
        """
        return self.tokenizer.decode(token_ids, skip_special_tokens=True)
    
    def get_vocab_size(self) -> int:
        """Get vocabulary size"""
        return self.tokenizer.vocab_size
