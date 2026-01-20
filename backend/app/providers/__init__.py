from app.providers.base_provider import BaseProvider
from app.providers.binance_provider import BinanceProvider
from app.providers.morocco_provider import MoroccoProvider
from app.providers.yahoo_provider import YahooProvider

# Try to import MT5 provider, but don't fail if not available
try:
    from app.providers.mt5_provider import MT5Provider
except ImportError:
    # Create a mock provider if MT5 is not available
    class MT5Provider:
        def __init__(self):
            raise Exception("MetaTrader5 package not installed. Please install with: pip install MetaTrader5")
        
        def get_quote(self, instrument: str) -> dict:
            raise Exception("MetaTrader5 package not installed")
        
        def get_ohlcv(self, instrument: str, timeframe: str, limit: int) -> list:
            raise Exception("MetaTrader5 package not installed")
        
        def get_supported_instruments(self) -> list:
            raise Exception("MetaTrader5 package not installed")
        
        def health(self) -> dict:
            return {
                'status': 'unavailable',
                'provider': 'MT5',
                'error': 'MetaTrader5 package not installed',
                'timestamp': 0
            }

__all__ = [
    'BaseProvider',
    'BinanceProvider',
    'MT5Provider',
    'MoroccoProvider'
]