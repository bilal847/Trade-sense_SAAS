import requests
import time
from typing import Dict, List, Optional
from app.providers.base_provider import BaseProvider


class BinanceProvider(BaseProvider):
    """
    Binance market data provider implementation.
    Uses Binance REST API for market data.
    """
    
    def __init__(self):
        self.base_url = "https://api.binance.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'TradeSense Quant Binance Provider',
            'Accept': 'application/json',
        })
    
    def get_quote(self, instrument: str) -> Dict:
        """
        Get current quote for a Binance instrument.

        Args:
            instrument: Binance symbol (e.g., 'BTCUSDT', 'ETHUSDT')
            
        Returns:
            Dict with keys: bid, ask, last, ts (timestamp)
        """
        try:
            # Get ticker price
            ticker_url = f"{self.base_url}/api/v3/ticker/price"
            params = {'symbol': instrument}
            response = self.session.get(ticker_url, params=params)
            response.raise_for_status()
            ticker_data = response.json()
            
            # Get order book for bid/ask prices
            book_url = f"{self.base_url}/api/v3/ticker/bookTicker"
            book_response = self.session.get(book_url, params=params)
            book_response.raise_for_status()
            book_data = book_response.json()
            
            current_time = int(time.time() * 1000)  # milliseconds
            
            return {
                'bid': float(book_data['bidPrice']),
                'ask': float(book_data['askPrice']),
                'last': float(ticker_data['price']),
                'ts': current_time
            }
        except Exception as e:
            # Return cached value or default if API fails
            current_time = int(time.time() * 1000)
            return {
                'bid': 0.0,
                'ask': 0.0,
                'last': 0.0,
                'ts': current_time
            }
    
    def get_ohlcv(self, instrument: str, timeframe: str, limit: int) -> List[Dict]:
        """
        Get OHLCV data for a Binance instrument.

        Args:
            instrument: Binance symbol (e.g., 'BTCUSDT', 'ETHUSDT')
            timeframe: Timeframe string (e.g., '1m', '5m', '1h', '1d')
            limit: Number of data points to return
            
        Returns:
            List of OHLCV data points with keys: timestamp, open, high, low, close, volume
        """
        try:
            klines_url = f"{self.base_url}/api/v3/klines"
            params = {
                'symbol': instrument,
                'interval': timeframe,
                'limit': limit
            }
            
            response = self.session.get(klines_url, params=params)
            response.raise_for_status()
            klines_data = response.json()
            
            ohlcv_list = []
            for kline in klines_data:
                ohlcv_list.append({
                    'timestamp': kline[0],
                    'open': float(kline[1]),
                    'high': float(kline[2]),
                    'low': float(kline[3]),
                    'close': float(kline[4]),
                    'volume': float(kline[5])
                })
            
            return ohlcv_list
        except Exception as e:
            # Return empty list if API fails
            return []
    
    def get_supported_instruments(self) -> List[Dict]:
        """
        Get list of supported instruments from Binance.

        Returns:
            List of dicts with keys: symbol, name, exchange, currency
        """
        try:
            exchange_info_url = f"{self.base_url}/api/v3/exchangeInfo"
            response = self.session.get(exchange_info_url)
            response.raise_for_status()
            data = response.json()
            
            # Filter for USDT pairs only to keep it focused
            instruments = []
            for symbol in data['symbols']:
                if symbol['symbol'].endswith('USDT') and symbol['status'] == 'TRADING':
                    instruments.append({
                        'symbol': symbol['symbol'],
                        'name': symbol['symbol'],
                        'exchange': 'BINANCE',
                        'currency': 'USDT'
                    })
            
            # Limit to major coins to avoid too many instruments
            major_coins = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT']
            filtered_instruments = [
                inst for inst in instruments 
                if inst['symbol'] in major_coins
            ]
            
            return filtered_instruments
        except Exception as e:
            # Return default list if API fails
            return [
                {'symbol': 'BTCUSDT', 'name': 'Bitcoin', 'exchange': 'BINANCE', 'currency': 'USDT'},
                {'symbol': 'ETHUSDT', 'name': 'Ethereum', 'exchange': 'BINANCE', 'currency': 'USDT'},
                {'symbol': 'XRPUSDT', 'name': 'Ripple', 'exchange': 'BINANCE', 'currency': 'USDT'}
            ]
    
    def health(self) -> Dict:
        """
        Check health/status of the Binance provider.

        Returns:
            Dict with health status information
        """
        try:
            # Test basic connectivity
            response = self.session.get(f"{self.base_url}/api/v3/ping")
            is_healthy = response.status_code == 200
            
            return {
                'provider': 'BINANCE',
                'status': 'healthy' if is_healthy else 'unhealthy',
                'timestamp': int(time.time() * 1000)
            }
        except Exception as e:
            return {
                'provider': 'BINANCE',
                'status': 'unhealthy',
                'timestamp': int(time.time() * 1000),
                'error': str(e)
            }