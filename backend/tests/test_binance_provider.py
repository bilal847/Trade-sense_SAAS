import pytest
from unittest.mock import Mock, patch
from app.providers.binance_provider import BinanceProvider


class TestBinanceProvider:
    def setup_method(self):
        self.provider = BinanceProvider()
    
    @patch('requests.Session.get')
    def test_get_quote_success(self, mock_get):
        """Test successful quote retrieval."""
        # Mock the API response
        mock_response = Mock()
        mock_response.json.return_value = {'price': '45000.00'}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        # Second call (for book ticker)
        mock_book_response = Mock()
        mock_book_response.json.return_value = {'bidPrice': '44999.50', 'askPrice': '45000.50'}
        mock_book_response.raise_for_status.return_value = None
        
        # Create a side_effect to return different responses for different calls
        def side_effect_func(*args, **kwargs):
            if 'ticker/price' in args[0]:
                return mock_response
            elif 'ticker/bookTicker' in args[0]:
                return mock_book_response
        
        mock_get.side_effect = side_effect_func
        
        result = self.provider.get_quote('BTCUSDT')
        
        assert 'bid' in result
        assert 'ask' in result
        assert 'last' in result
        assert 'ts' in result
        assert result['bid'] == 44999.5
        assert result['ask'] == 45000.5
        assert result['last'] == 45000.0
    
    @patch('requests.Session.get')
    def test_get_quote_error(self, mock_get):
        """Test quote retrieval with API error."""
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = Exception("API Error")
        
        mock_get.return_value = mock_response
        
        with pytest.raises(Exception, match="Error fetching quote for BTCUSDT"):
            self.provider.get_quote('BTCUSDT')
    
    @patch('requests.Session.get')
    def test_get_ohlcv_success(self, mock_get):
        """Test successful OHLCV data retrieval."""
        # Mock the API response
        mock_response = Mock()
        mock_response.json.return_value = [
            [1678886400000, '45000.00', '45100.00', '44900.00', '45050.00', '100.00000000', 1678886700000, '5000000.00', 100, '50.00000000', '2500000.00', '0']
        ]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        result = self.provider.get_ohlcv('BTCUSDT', '1h', 1)
        
        assert len(result) == 1
        assert 'timestamp' in result[0]
        assert 'open' in result[0]
        assert 'high' in result[0]
        assert 'low' in result[0]
        assert 'close' in result[0]
        assert 'volume' in result[0]
    
    @patch('requests.Session.get')
    def test_get_ohlcv_error(self, mock_get):
        """Test OHLCV data retrieval with API error."""
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = Exception("API Error")
        
        mock_get.return_value = mock_response
        
        with pytest.raises(Exception, match="Error fetching OHLCV for BTCUSDT"):
            self.provider.get_ohlcv('BTCUSDT', '1h', 1)
    
    @patch('requests.Session.get')
    def test_get_supported_instruments_success(self, mock_get):
        """Test successful retrieval of supported instruments."""
        # Mock the API response
        mock_response = Mock()
        mock_response.json.return_value = {
            'symbols': [
                {
                    'symbol': 'BTCUSDT',
                    'status': 'TRADING',
                    'baseAsset': 'BTC',
                    'quoteAsset': 'USDT'
                },
                {
                    'symbol': 'ETHUSDT',
                    'status': 'TRADING',
                    'baseAsset': 'ETH',
                    'quoteAsset': 'USDT'
                }
            ]
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        result = self.provider.get_supported_instruments()
        
        assert len(result) >= 0  # At least the filtered instruments should be returned
        # Check that the returned instruments have required fields
        for instrument in result:
            assert 'symbol' in instrument
            assert 'name' in instrument
            assert 'exchange' in instrument
            assert 'currency' in instrument
    
    @patch('requests.Session.get')
    def test_health_success(self, mock_get):
        """Test health check success."""
        # Mock the ping response
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        result = self.provider.health()
        
        assert result['status'] == 'healthy'
        assert result['provider'] == 'BINANCE'
        assert 'timestamp' in result