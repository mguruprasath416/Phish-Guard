#!/usr/bin/env python3
"""
OpenPhish API Client
Handles communication with OpenPhish threat intelligence feed
"""

import requests
from typing import Dict, List, Optional
import re

class OpenPhishClient:
    """OpenPhish API client"""
    
    def __init__(self, api_url: Optional[str] = None):
        self.api_url = api_url or 'https://openphish.com/feed.txt'
    
    def check_url(self, url: str) -> Dict:
        """
        Check if URL is in OpenPhish feed
        
        Args:
            url: URL to check
            
        Returns:
            Check results
        """
        try:
            # Fetch OpenPhish feed
            response = requests.get(self.api_url, timeout=10)
            
            if response.status_code != 200:
                return self._mock_response(url)
            
            feed_data = response.text
            url_lower = url.lower()
            
            # Check if URL or domain is in feed
            is_phishing = False
            for line in feed_data.split('\n'):
                if line.strip() and line.strip().lower() in url_lower:
                    is_phishing = True
                    break
            
            return {
                'isPhishing': is_phishing,
                'source': 'openphish',
                'confidence': 0.8 if is_phishing else 0.0
            }
            
        except Exception as e:
            print(f"OpenPhish API error: {e}")
            return self._mock_response(url)
    
    def check_domain(self, domain: str) -> Dict:
        """
        Check if domain is in OpenPhish feed
        
        Args:
            domain: Domain to check
            
        Returns:
            Check results
        """
        try:
            response = requests.get(self.api_url, timeout=10)
            
            if response.status_code != 200:
                return self._mock_response(domain)
            
            feed_data = response.text
            domain_lower = domain.lower()
            
            is_phishing = False
            for line in feed_data.split('\n'):
                if line.strip() and domain_lower in line.strip().lower():
                    is_phishing = True
                    break
            
            return {
                'isPhishing': is_phishing,
                'source': 'openphish',
                'confidence': 0.8 if is_phishing else 0.0
            }
            
        except Exception as e:
            print(f"OpenPhish API error: {e}")
            return self._mock_response(domain)
    
    def _mock_response(self, target: str) -> Dict:
        """Return mock response when API is unavailable"""
        # Heuristic-based mock
        suspicious_patterns = ['login', 'signin', 'verify', 'account', 'secure']
        is_suspicious = any(pattern in target.lower() for pattern in suspicious_patterns)
        
        return {
            'isPhishing': is_suspicious,
            'source': 'openphish_mock',
            'confidence': 0.5 if is_suspicious else 0.0
        }
