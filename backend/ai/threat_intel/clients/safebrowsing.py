#!/usr/bin/env python3
"""
Google Safe Browsing API Client
Handles communication with Google Safe Browsing API
"""

import requests
import os
from typing import Dict, Optional, List

class SafeBrowsingClient:
    """Google Safe Browsing API client"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('GOOGLE_SAFE_BROWSING_API_KEY')
        self.base_url = 'https://safebrowsing.googleapis.com/v4/threatMatches:find'
    
    def check_url(self, url: str) -> Dict:
        """
        Check if URL is in Google Safe Browsing database
        
        Args:
            url: URL to check
            
        Returns:
            Check results
        """
        if not self.api_key:
            return self._mock_response(url)
        
        try:
            payload = {
                'client': {
                    'clientId': 'phishguard-ai',
                    'clientVersion': '1.0.0'
                },
                'threatInfo': [{
                    'threatTypes': ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
                    'platformTypes': ['ANY_PLATFORM'],
                    'threatEntryTypes': ['URL'],
                    'url': url
                }]
            }
            
            response = requests.post(
                f'{self.base_url}?key={self.api_key}',
                json=payload,
                timeout=10
            )
            
            if response.status_code != 200:
                return self._mock_response(url)
            
            data = response.json()
            
            if 'matches' in data and len(data['matches']) > 0:
                return {
                    'isMalicious': True,
                    'threatTypes': [match['threatType'] for match in data['matches']],
                    'source': 'google_safe_browsing'
                }
            else:
                return {
                    'isMalicious': False,
                    'threatTypes': [],
                    'source': 'google_safe_browsing'
                }
            
        except Exception as e:
            print(f"Google Safe Browsing API error: {e}")
            return self._mock_response(url)
    
    def check_urls(self, urls: List[str]) -> Dict:
        """
        Check multiple URLs
        
        Args:
            urls: List of URLs to check
            
        Returns:
            Check results for all URLs
        """
        if not self.api_key:
            return {url: self._mock_response(url) for url in urls}
        
        try:
            threat_entries = [
                {
                    'threatTypes': ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
                    'platformTypes': ['ANY_PLATFORM'],
                    'threatEntryTypes': ['URL'],
                    'url': url
                }
                for url in urls
            ]
            
            payload = {
                'client': {
                    'clientId': 'phishguard-ai',
                    'clientVersion': '1.0.0'
                },
                'threatInfo': threat_entries
            }
            
            response = requests.post(
                f'{self.base_url}?key={self.api_key}',
                json=payload,
                timeout=10
            )
            
            if response.status_code != 200:
                return {url: self._mock_response(url) for url in urls}
            
            data = response.json()
            
            results = {}
            if 'matches' in data:
                for url in urls:
                    url_matches = [m for m in data['matches'] if m['threat']['url'] == url]
                    results[url] = {
                        'isMalicious': len(url_matches) > 0,
                        'threatTypes': [m['threatType'] for m in url_matches] if url_matches else [],
                        'source': 'google_safe_browsing'
                    }
            else:
                results = {url: {
                    'isMalicious': False,
                    'threatTypes': [],
                    'source': 'google_safe_browsing'
                } for url in urls}
            
            return results
            
        except Exception as e:
            print(f"Google Safe Browsing API error: {e}")
            return {url: self._mock_response(url) for url in urls}
    
    def _mock_response(self, url: str) -> Dict:
        """Return mock response when API is unavailable"""
        # Heuristic-based mock
        suspicious_keywords = ['malware', 'phishing', 'scam', 'fake']
        is_malicious = any(keyword in url.lower() for keyword in suspicious_keywords)
        
        return {
            'isMalicious': is_malicious,
            'threatTypes': ['SOCIAL_ENGINEERING'] if is_malicious else [],
            'source': 'google_safe_browsing_mock'
        }
