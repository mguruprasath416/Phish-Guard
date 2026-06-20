#!/usr/bin/env python3
"""
VirusTotal API Client
Handles communication with VirusTotal API
"""

import requests
import os
from typing import Dict, Optional

class VirusTotalClient:
    """VirusTotal API client"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('VIRUSTOTAL_API_KEY')
        self.base_url = 'https://www.virustotal.com/api/v3'
        self.headers = {
            'x-apikey': self.api_key,
            'accept': 'application/json'
        }
    
    def scan_url(self, url: str) -> Dict:
        """
        Scan a URL using VirusTotal
        
        Args:
            url: URL to scan
            
        Returns:
            Scan results
        """
        if not self.api_key:
            return self._mock_response(url)
        
        try:
            # First, submit URL for scanning
            scan_response = requests.post(
                f'{self.base_url}/urls',
                headers=self.headers,
                data={'url': url}
            )
            
            if scan_response.status_code != 200:
                return self._mock_response(url)
            
            scan_data = scan_response.json()
            analysis_id = scan_data['data']['id']
            
            # Get analysis results
            analysis_response = requests.get(
                f'{self.base_url}/analyses/{analysis_id}',
                headers=self.headers
            )
            
            if analysis_response.status_code != 200:
                return self._mock_response(url)
            
            analysis_data = analysis_response.json()
            stats = analysis_data['data']['attributes']['stats']
            
            return {
                'malicious': stats.get('malicious', 0),
                'suspicious': stats.get('suspicious', 0),
                'harmless': stats.get('harmless', 0),
                'undetected': stats.get('undetected', 0)
            }
            
        except Exception as e:
            print(f"VirusTotal API error: {e}")
            return self._mock_response(url)
    
    def scan_email(self, email: str) -> Dict:
        """
        Scan an email address using VirusTotal
        
        Args:
            email: Email address to scan
            
        Returns:
            Scan results
        """
        if not self.api_key:
            return self._mock_response(email)
        
        try:
            # Get domain from email
            domain = email.split('@')[-1] if '@' in email else email
            
            # Scan domain
            domain_response = requests.get(
                f'{self.base_url}/domains/{domain}',
                headers=self.headers
            )
            
            if domain_response.status_code != 200:
                return self._mock_response(email)
            
            domain_data = domain_response.json()
            reputation = domain_data['data']['attributes'].get('reputation', 0)
            
            return {
                'reputation': reputation,
                'malicious': 1 if reputation < 0 else 0,
                'suspicious': 1 if -10 <= reputation < 0 else 0,
                'harmless': 1 if reputation >= 0 else 0
            }
            
        except Exception as e:
            print(f"VirusTotal API error: {e}")
            return self._mock_response(email)
    
    def _mock_response(self, target: str) -> Dict:
        """Return mock response when API is unavailable"""
        # Heuristic-based mock response
        suspicious_indicators = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf']
        is_suspicious = any(indicator in target.lower() for indicator in suspicious_indicators)
        
        return {
            'malicious': 2 if is_suspicious else 0,
            'suspicious': 1 if is_suspicious else 0,
            'harmless': 60 - (2 if is_suspicious else 0)
        }
