#!/usr/bin/env python3
"""
AbuseIPDB API Client
Handles communication with AbuseIPDB API
"""

import requests
import os
from typing import *
import re

class AbuseIPDBClient:
    """AbuseIPDB API client"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('ABUSEIPDB_API_KEY')
        self.base_url = 'https://api.abuseipdb.com/api/v2'
        self.headers = {
            'Key': self.api_key,
            'Accept': 'application/json'
        }
    
    def check_ip(self, ip_address: str) -> Dict:
        """
        Check IP address reputation
        
        Args:
            ip_address: IP address to check
            
        Returns:
            IP reputation data
        """
        if not self.api_key:
            return self._mock_response(ip_address)
        
        try:
            response = requests.get(
                f'{self.base_url}/check',
                headers=self.headers,
                params={'ipAddress': ip_address, 'maxAgeInDays': 90},
                timeout=10
            )
            
            if response.status_code != 200:
                return self._mock_response(ip_address)
            
            data = response.json()
            abuse_data = data['data']
            
            return {
                'abuseConfidenceScore': abuse_data.get('abuseConfidenceScore', 0),
                'isWhitelisted': abuse_data.get('isWhitelisted', False),
                'countryCode': abuse_data.get('countryCode', 'Unknown'),
                'usageType': abuse_data.get('usageType', 'Unknown'),
                'isp': abuse_data.get('isp', 'Unknown'),
                'domain': abuse_data.get('domain', 'Unknown'),
                'totalReports': abuse_data.get('totalReports', 0),
                'lastReportedAt': abuse_data.get('lastReportedAt', None)
            }
            
        except Exception as e:
            print(f"AbuseIPDB API error: {e}")
            return self._mock_response(ip_address)
    
    def check_url(self, url: str) -> Dict:
        """
        Check URL by extracting IP and checking it
        
        Args:
            url: URL to check
            
        Returns:
            IP reputation data
        """
        try:
            # Extract IP from URL (simplified)
            import socket
            hostname = url.split('/')[2] if '://' in url else url.split('/')[0]
            ip_address = socket.gethostbyname(hostname)
            
            return self.check_ip(ip_address)
            
        except Exception as e:
            print(f"URL to IP resolution error: {e}")
            return self._mock_response(url)
    
    def report_ip(self, ip_address: str, categories: List[int], comment: str) -> Dict:
        """
        Report an IP address
        
        Args:
            ip_address: IP to report
            categories: List of category IDs
            comment: Report comment
            
        Returns:
            Report response
        """
        if not self.api_key:
            return {'success': False, 'error': 'API key not provided'}
        
        try:
            response = requests.post(
                f'{self.base_url}/report',
                headers=self.headers,
                json={
                    'ip': ip_address,
                    'categories': categories,
                    'comment': comment
                },
                timeout=10
            )
            
            if response.status_code == 200:
                return {'success': True, 'data': response.json()}
            else:
                return {'success': False, 'error': response.text}
                
        except Exception as e:
            print(f"AbuseIPDB report error: {e}")
            return {'success': False, 'error': str(e)}
    
    def _mock_response(self, target: str) -> Dict:
        """Return mock response when API is unavailable"""
        # Heuristic-based mock
        suspicious_indicators = ['.xyz', '.top', '.tk', '.ml']
        is_suspicious = any(indicator in target.lower() for indicator in suspicious_indicators)
        
        return {
            'abuseConfidenceScore': 45 if is_suspicious else 0,
            'isWhitelisted': not is_suspicious,
            'countryCode': 'Unknown',
            'usageType': 'Unknown',
            'isp': 'Unknown',
            'domain': 'Unknown',
            'totalReports': 1 if is_suspicious else 0,
            'lastReportedAt': None
        }
