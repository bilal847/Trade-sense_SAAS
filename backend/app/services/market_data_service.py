import time
from typing import Dict, List, Optional
from app.providers import BinanceProvider, MT5Provider, MoroccoProvider
from app.utils import InMemoryCache
import logging

logger = logging.getLogger(__name__)


class MarketDataService:
    """
    Service class to manage market data from multiple providers.
    Implements the adapter pattern to provide a unified interface to different market data providers.
    """
    
    def __init__(self):
        # Initialize providers
        try:
            self.binance_provider = BinanceProvider()
        except Exception as e:
            logger.error(f"Failed to initialize Binance provider: {e}")
            self.binance_provider = None
            
        try:
            self.mt5_provider = MT5Provider()
        except Exception as e:
            logger.warning(f"MT5 provider not available: {e}")
            self.mt5_provider = None
            
        try:
            self.morocco_provider = MoroccoProvider()
        except Exception as e:
            logger.error(f"Failed to initialize Morocco provider: {e}")
            self.morocco_provider = None
        
        # Map providers to their instances
        self.providers = {}
        if self.binance_provider:
            self.providers['BINANCE'] = self.binance_provider
        if self.mt5_provider:
            self.providers['MT5'] = self.mt5_provider
        if self.morocco_provider:
            self.providers['MOROCCO'] = self.morocco_provider
        
        # Initialize cache
        self.cache = InMemoryCache()
    
    def get_quote(self, instrument: str, provider: str) -> Dict:
        """
        Get current quote for an instrument from a specific provider.

        Args:
            instrument: Provider-specific instrument symbol
            provider: Provider name ('BINANCE', 'MT5', 'MOROCCO')

        Returns:
            Dict with keys: bid, ask, last, ts (timestamp)
        """
        cache_key = f"quote_{provider}_{instrument}"
        
        # Try to get from cache first
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Get provider instance
        provider_instance = self.providers.get(provider.upper())
        if not provider_instance:
            raise ValueError(f"Provider {provider} not available")
        
        # Get fresh data
        result = provider_instance.get_quote(instrument)
        
        # Cache the result (TTL from config, default 10 seconds)
        ttl = 10  # Use default TTL of 10 seconds
        try:
            from app.config import Config
            ttl = Config.QUOTE_CACHE_TTL
        except:
            pass
        
        self.cache.set(cache_key, result, ttl)
        
        return result
    
    def get_ohlcv(self, instrument: str, provider: str, timeframe: str, limit: int) -> List[Dict]:
        """
        Get OHLCV data for an instrument from a specific provider.

        Args:
            instrument: Provider-specific instrument symbol
            provider: Provider name ('BINANCE', 'MT5', 'MOROCCO')
            timeframe: Timeframe string (e.g., '1m', '5m', '1h', '1d')
            limit: Number of data points to return

        Returns:
            List of dicts with keys: timestamp, open, high, low, close, volume
        """
        cache_key = f"ohlcv_{provider}_{instrument}_{timeframe}_{limit}"
        
        # Try to get from cache first
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Get provider instance
        provider_instance = self.providers.get(provider.upper())
        if not provider_instance:
            raise ValueError(f"Provider {provider} not available")
        
        # Get fresh data
        result = provider_instance.get_ohlcv(instrument, timeframe, limit)
        
        # Cache the result (TTL from config, default 60 seconds)
        ttl = 60  # Use default TTL of 60 seconds
        try:
            from app.config import Config
            ttl = Config.OHLCV_CACHE_TTL
        except:
            pass
        
        self.cache.set(cache_key, result, ttl)
        
        return result
    
    def get_supported_instruments(self, provider: Optional[str] = None) -> List[Dict]:
        """
        Get list of supported instruments from all or a specific provider.

        Args:
            provider: Optional provider name to get instruments from specific provider

        Returns:
            List of instrument dictionaries
        """
        if provider:
            provider_instance = self.providers.get(provider.upper())
            if not provider_instance:
                raise ValueError(f"Provider {provider} not available")
            return provider_instance.get_supported_instruments()
        else:
            all_instruments = []
            for provider_name, provider_instance in self.providers.items():
                try:
                    instruments = provider_instance.get_supported_instruments()
                    # Add provider info to each instrument
                    for instrument in instruments:
                        instrument['provider'] = provider_name
                    all_instruments.extend(instruments)
                except Exception as e:
                    logger.error(f"Error getting instruments from {provider_name}: {e}")
                    continue
            return all_instruments
    
    def health_check(self) -> Dict:
        """
        Check health of all providers.

        Returns:
            Dict with health status for each provider
        """
        health_status = {
            'timestamp': int(time.time() * 1000),
            'providers': {}
        }
        
        for provider_name, provider_instance in self.providers.items():
            try:
                health_status['providers'][provider_name] = provider_instance.health()
            except Exception as e:
                health_status['providers'][provider_name] = {
                    'provider': provider_name,
                    'status': 'error',
                    'timestamp': int(time.time() * 1000),
                    'error': str(e)
                }
        
        return health_status