from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple


class BaseProvider(ABC):
    """
    Abstract base class for market data providers.
    All providers must implement this interface.
    """
    
    @abstractmethod
    def get_quote(self, instrument: str) -> Dict:
        """
        Get current quote for an instrument.
        
        Args:
            instrument: Provider-specific instrument symbol
            
        Returns:
            Dict with keys: bid, ask, last, ts (timestamp)
        """
        pass
    
    @abstractmethod
    def get_ohlcv(self, instrument: str, timeframe: str, limit: int) -> List[Dict]:
        """
        Get OHLCV data for an instrument.
        
        Args:
            instrument: Provider-specific instrument symbol
            timeframe: Timeframe string (e.g., '1m', '5m', '1h', '1d')
            limit: Number of data points to return
            
        Returns:
            List of dicts with keys: timestamp, open, high, low, close, volume
        """
        pass
    
    @abstractmethod
    def get_supported_instruments(self) -> List[Dict]:
        """
        Get list of supported instruments.
        
        Returns:
            List of dicts with keys: symbol, name, exchange, currency
        """
        pass
    
    @abstractmethod
    def health(self) -> Dict:
        """
        Check provider health/status.
        
        Returns:
            Dict with health status information
        """
        pass