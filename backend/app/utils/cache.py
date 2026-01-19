import time
import threading
from typing import Any, Optional


class InMemoryCache:
    """
    Simple in-memory cache with TTL (Time To Live) functionality.
    Used for caching market data to avoid hitting API rate limits.
    """
    
    def __init__(self):
        self._cache = {}
        self._expirations = {}
        self._lock = threading.RLock()  # Use reentrant lock for thread safety
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache if it exists and hasn't expired.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found or expired
        """
        with self._lock:
            if key in self._expirations:
                if time.time() >= self._expirations[key]:
                    # Entry has expired, remove it
                    del self._cache[key]
                    del self._expirations[key]
                    return None
            return self._cache.get(key)
    
    def set(self, key: str, value: Any, ttl: int = 60) -> None:
        """
        Set value in cache with TTL.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
        """
        with self._lock:
            self._cache[key] = value
            self._expirations[key] = time.time() + ttl
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if key existed and was deleted, False otherwise
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                if key in self._expirations:
                    del self._expirations[key]
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cache entries."""
        with self._lock:
            self._cache.clear()
            self._expirations.clear()
    
    def cleanup_expired(self) -> int:
        """
        Manually cleanup expired entries.
        
        Returns:
            Number of expired entries removed
        """
        with self._lock:
            current_time = time.time()
            expired_keys = [
                key for key, exp_time in self._expirations.items()
                if current_time >= exp_time
            ]
            
            for key in expired_keys:
                del self._cache[key]
                del self._expirations[key]
            
            return len(expired_keys)


# Global cache instance
cache = InMemoryCache()