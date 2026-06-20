#!/usr/bin/env python3
"""
URL Feature Extraction
Extracts features from URLs for ML model
"""

from urllib.parse import urlparse
import re
from typing import Dict

def extract_url_features(url: str) -> Dict[str, any]:
    """
    Extract features from URL for ML model
    
    Args:
        url: URL string
        
    Returns:
        Dictionary of extracted features
    """
    features = {}
    
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname.lower() if parsed.hostname else ''
        path = parsed.path.lower()
        query = parsed.query.lower()
        
        # Basic features
        features['url_length'] = len(url)
        features['hostname_length'] = len(hostname)
        features['path_length'] = len(path)
        features['query_length'] = len(query)
        
        # Domain features
        domain_parts = hostname.split('.')
        features['subdomain_count'] = len(domain_parts) - 2 if len(domain_parts) > 2 else 0
        features['domain_parts_count'] = len(domain_parts)
        
        # Character features
        features['digit_count'] = sum(c.isdigit() for c in url)
        features['special_char_count'] = sum(not c.isalnum() for c in url)
        features['dash_count'] = url.count('-')
        features['dot_count'] = url.count('.')
        features['at_count'] = url.count('@')
        features['underscore_count'] = url.count('_')
        
        # Protocol
        features['is_https'] = 1 if parsed.scheme == 'https' else 0
        features['is_http'] = 1 if parsed.scheme == 'http' else 0
        
        # Suspicious keywords
        suspicious_keywords = ['secure', 'verify', 'account', 'login', 'signin', 
                             'bank', 'paypal', 'update', 'confirm', 'password']
        features['suspicious_keyword_count'] = sum(1 for kw in suspicious_keywords if kw in hostname)
        
        # Suspicious TLDs
        suspicious_tlds = ['.xyz', '.top', '.zip', '.tk', '.ml', '.ga', '.cf', '.cc']
        features['has_suspicious_tld'] = 1 if any(hostname.endswith(tld) for tld in suspicious_tlds) else 0
        
        # IP address
        features['is_ip_address'] = 1 if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname) else 0
        
        # URL shorteners
        shorteners = ['bit.ly', 'tinyurl.com', 'short.link', 'goo.gl', 't.co']
        features['is_shortener'] = 1 if any(shortener in hostname for shortener in shorteners) else 0
        
        # Path features
        features['path_depth'] = path.count('/')
        features['has_exe'] = 1 if '.exe' in path.lower() else 0
        features['has_php'] = 1 if '.php' in path.lower() else 0
        
    except Exception as e:
        # If URL parsing fails, return default features
        features = {key: 0 for key in [
            'url_length', 'hostname_length', 'path_length', 'query_length',
            'subdomain_count', 'domain_parts_count', 'digit_count',
            'special_char_count', 'dash_count', 'dot_count', 'at_count',
            'underscore_count', 'is_https', 'is_http', 'suspicious_keyword_count',
            'has_suspicious_tld', 'is_ip_address', 'is_shortener',
            'path_depth', 'has_exe', 'has_php'
        ]}
    
    return features

def extract_domain_features(domain: str) -> Dict[str, any]:
    """
    Extract features from domain name
    
    Args:
        domain: Domain string
        
    Returns:
        Dictionary of extracted features
    """
    features = {}
    domain = domain.lower()
    
    # Basic features
    features['domain_length'] = len(domain)
    features['has_digits'] = 1 if any(c.isdigit() for c in domain) else 0
    features['has_dash'] = 1 if '-' in domain else 0
    
    # TLD features
    parts = domain.split('.')
    features['tld'] = parts[-1] if len(parts) > 1 else ''
    features['subdomain_count'] = len(parts) - 2 if len(parts) > 2 else 0
    
    # Suspicious patterns
    suspicious_patterns = ['secure', 'verify', 'account', 'login', 'bank']
    features['has_suspicious_pattern'] = 1 if any(p in domain for p in suspicious_patterns) else 0
    
    return features
