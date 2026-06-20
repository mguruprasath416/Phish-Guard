#!/usr/bin/env python3
"""
Cache Manager
Handles caching of threat intelligence results
"""

import json
import time
from typing import Dict, Optional, Any
from datetime import datetime, timedelta

class CacheManager:
    """Simple in-memory cache manager"""
    
    def __init__(self, default_ttl: int = 900):
        """
        Initialize cache manager
        
        Args:
            default_ttl: Default time-to-live in seconds (default: 15 minutes)
        """
        self.cache = {}
        self.default_ttl = default_ttl
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value if exists and not expired, None otherwise
        """
        if key in self.cache:
            entry = self.cache[key]
            
            # Check if expired
            if datetime.utcnow() < entry['expires']:
                return entry['value']
            else:
                # Remove expired entry
                del self.cache[key]
        
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds (uses default if None)
        """
        if ttl is None:
            ttl = self.default_ttl
        
        expires = datetime.utcnow() + timedelta(seconds=ttl)
        
        self.cache[key] = {
            'value': value,
            'expires': expires,
            'created': datetime.utcnow()
        }
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key: Cache key
            
        Returns:
            True if deleted, False if not found
        """
        if key in self.cache:
            del self.cache[key]
            return True
        return False
    
    def clear(self) -> None:
        """Clear all cache entries"""
        self.cache.clear()
    
    def cleanup_expired(self) -> int:
        """
        Remove all expired entries from cache
        
        Returns:
            Number of entries removed
        """
        now = datetime.utcnow()
        expired_keys = [
            key for key, entry in self.cache.items()
            if now >= entry['expires']
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Dictionary with cache statistics
        """
        now = datetime.utcnow()
        active_entries = sum(
            1 for entry in self.cache.values()
            if now < entry['expires']
        )
        expired_entries = len(self.cache) - active_entries
        
        return {
            'total_entries': len(self.cache),
            'active_entries': active_entries,
            'expired_entries': expired_entries,
            'default_ttl': self.default_ttl
        }
    
    def get_keys(self) -> list:
        """Get all cache keys"""
        return list(self.cache.keys())

# Global cache instance
cache = CacheManager()
