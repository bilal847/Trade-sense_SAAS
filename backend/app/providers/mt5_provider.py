import time
from typing import Dict, List, Optional
from app.providers.base_provider import BaseProvider
from datetime import datetime, timedelta
import pytz

# Try to import MT5, but handle gracefully if not available
try:
    import MetaTrader5 as mt5
    import pandas as pd
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False
    print("MT5 provider not available: MetaTrader5 package not installed. Please install with: pip install MetaTrader5")


class MT5Provider(BaseProvider):
    """
    MT5 market data provider implementation.
    Uses MetaTrader5 Python package to connect to MT5 terminal.
    """
    
    def __init__(self):
        if MT5_AVAILABLE:
            # Initialize MT5 connection
            if not mt5.initialize():
                raise Exception("MT5 initialization failed")
        else:
            print("MT5 provider disabled - MetaTrader5 not installed")
    
    def __del__(self):
        """Clean up MT5 connection when provider is destroyed."""
        if MT5_AVAILABLE:
            mt5.shutdown()
    
    def get_quote(self, instrument: str) -> Dict:
        """
        Get current quote for an MT5 instrument.

        Args:
            instrument: MT5 symbol (e.g., 'EURUSD', 'GBPUSD', 'USDJPY')
            
        Returns:
            Dict with keys: bid, ask, last, ts (timestamp)
        """
        if not MT5_AVAILABLE:
            # Return mock data when MT5 is not available
            current_time = int(time.time() * 1000)
            return {
                'bid': 0.0,
                'ask': 0.0,
                'last': 0.0,
                'ts': current_time
            }
        
        try:
            # Get symbol info
            symbol_info = mt5.symbol_info(instrument)
            if symbol_info is None:
                raise ValueError(f"Symbol {instrument} not found")
            
            # Get tick data
            tick = mt5.symbol_info_tick(instrument)
            
            current_time = int(time.time() * 1000)  # milliseconds
            
            return {
                'bid': tick.bid,
                'ask': tick.ask,
                'last': tick.last if hasattr(tick, 'last') else (tick.bid + tick.ask) / 2,
                'ts': current_time
            }
        except Exception as e:
            # Return mock data on error
            current_time = int(time.time() * 1000)
            return {
                'bid': 0.0,
                'ask': 0.0,
                'last': 0.0,
                'ts': current_time
            }
    
    def get_ohlcv(self, instrument: str, timeframe: str, limit: int) -> List[Dict]:
        """
        Get OHLCV data for an MT5 instrument.

        Args:
            instrument: MT5 symbol (e.g., 'EURUSD', 'GBPUSD', 'USDJPY')
            timeframe: Timeframe string (e.g., '1m', '5m', '1h', '1d')
            limit: Number of data points to return
            
        Returns:
            List of dicts with keys: timestamp, open, high, low, close, volume
        """
        if not MT5_AVAILABLE:
            # Return mock data when MT5 is not available
            return []
        
        try:
            # Map timeframe strings to MT5 constants
            tf_map = {
                '1m': mt5.TIMEFRAME_M1,
                '5m': mt5.TIMEFRAME_M5,
                '15m': mt5.TIMEFRAME_M15,
                '30m': mt5.TIMEFRAME_M30,
                '1h': mt5.TIMEFRAME_H1,
                '4h': mt5.TIMEFRAME_H4,
                '1d': mt5.TIMEFRAME_D1,
                '1w': mt5.TIMEFRAME_W1,
                '1mn': mt5.TIMEFRAME_MN1
            }
            
            if timeframe not in tf_map:
                raise ValueError(f"Unsupported timeframe: {timeframe}")
            
            mt5_timeframe = tf_map[timeframe]
            
            # Get rates
            rates = mt5.copy_rates_from_pos(instrument, mt5_timeframe, 0, limit)
            
            if rates is None:
                return []
            
            # Convert to required format
            ohlcv_list = []
            for rate in rates:
                ohlcv_list.append({
                    'timestamp': int(rate[0]) * 1000,  # Convert to milliseconds
                    'open': float(rate[1]),
                    'high': float(rate[2]),
                    'low': float(rate[3]),
                    'close': float(rate[4]),
                    'volume': int(rate[5])
                })
            
            return ohlcv_list
        except Exception as e:
            # Return empty list on error
            return []
    
    def get_supported_instruments(self) -> List[Dict]:
        """
        Get list of supported instruments from MT5.

        Returns:
            List of dicts with keys: symbol, name, exchange, currency
        """
        if not MT5_AVAILABLE:
            # Return mock data when MT5 is not available
            return [
                {'symbol': 'EURUSD', 'name': 'Euro vs US Dollar', 'exchange': 'MT5', 'currency': 'USD'},
                {'symbol': 'GBPUSD', 'name': 'British Pound vs US Dollar', 'exchange': 'MT5', 'currency': 'USD'},
                {'symbol': 'USDJPY', 'name': 'US Dollar vs Japanese Yen', 'exchange': 'MT5', 'currency': 'JPY'},
                {'symbol': 'USDCHF', 'name': 'US Dollar vs Swiss Franc', 'exchange': 'MT5', 'currency': 'CHF'},
                {'symbol': 'AUDUSD', 'name': 'Australian Dollar vs US Dollar', 'exchange': 'MT5', 'currency': 'USD'},
                {'symbol': 'USDCAD', 'name': 'US Dollar vs Canadian Dollar', 'exchange': 'MT5', 'currency': 'CAD'},
                {'symbol': 'NZDUSD', 'name': 'New Zealand Dollar vs US Dollar', 'exchange': 'MT5', 'currency': 'USD'},
                {'symbol': 'EURJPY', 'name': 'Euro vs Japanese Yen', 'exchange': 'MT5', 'currency': 'JPY'}
            ]
        
        try:
            # Get all symbols
            symbols = mt5.symbols_get()
            instruments = []
            
            # Filter for major and minor forex pairs
            major_pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURJPY']
            
            for symbol in symbols:
                if symbol.name in major_pairs:
                    instruments.append({
                        'symbol': symbol.name,
                        'name': symbol.description,
                        'exchange': 'MT5',
                        'currency': symbol.currency_profit
                    })
            
            return instruments
        except Exception as e:
            # Return default list on error
            return [
                {'symbol': 'EURUSD', 'name': 'Euro vs US Dollar', 'exchange': 'MT5', 'currency': 'USD'},
                {'symbol': 'GBPUSD', 'name': 'British Pound vs US Dollar', 'exchange': 'MT5', 'currency': 'USD'},
                {'symbol': 'USDJPY', 'name': 'US Dollar vs Japanese Yen', 'exchange': 'MT5', 'currency': 'JPY'},
                {'symbol': 'USDCHF', 'name': 'US Dollar vs Swiss Franc', 'exchange': 'MT5', 'currency': 'CHF'},
                {'symbol': 'AUDUSD', 'name': 'Australian Dollar vs US Dollar', 'exchange': 'MT5', 'currency': 'USD'},
                {'symbol': 'USDCAD', 'name': 'US Dollar vs Canadian Dollar', 'exchange': 'MT5', 'currency': 'CAD'},
                {'symbol': 'NZDUSD', 'name': 'New Zealand Dollar vs US Dollar', 'exchange': 'MT5', 'currency': 'USD'},
                {'symbol': 'EURJPY', 'name': 'Euro vs Japanese Yen', 'exchange': 'MT5', 'currency': 'JPY'}
            ]
    
    def health(self) -> Dict:
        """
        Check health/status of the MT5 provider.

        Returns:
            Dict with health status information
        """
        if not MT5_AVAILABLE:
            return {
                'provider': 'MT5',
                'status': 'unavailable',
                'timestamp': int(time.time() * 1000),
                'error': 'MetaTrader5 package not installed'
            }
        
        try:
            # Test basic connectivity
            account_info = mt5.account_info()
            is_healthy = account_info is not None
            
            return {
                'provider': 'MT5',
                'status': 'healthy' if is_healthy else 'unhealthy',
                'timestamp': int(time.time() * 1000)
            }
        except Exception as e:
            return {
                'provider': 'MT5',
                'status': 'unhealthy',
                'timestamp': int(time.time() * 1000),
                'error': str(e)
            }