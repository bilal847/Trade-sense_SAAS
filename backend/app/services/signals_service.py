import pandas as pd
import numpy as np
from typing import Dict, List
from app.services.market_data_service import MarketDataService
from datetime import datetime, timedelta


class SignalsService:
    """
    Service class to generate trading signals based on technical indicators.
    Provides quant-friendly signals for the dashboard.
    """
    
    def __init__(self):
        self.market_data_service = MarketDataService()
    
    def get_signals(self, instrument: str, provider: str, timeframe: str = '1h', limit: int = 100) -> Dict:
        """
        Generate trading signals for an instrument.
        
        Args:
            instrument: Instrument symbol
            provider: Provider name
            timeframe: Timeframe for analysis
            limit: Number of data points to analyze
            
        Returns:
            Dict with signals and indicators
        """
        # Get OHLCV data
        ohlcv_data = self.market_data_service.get_ohlcv(instrument, provider, timeframe, limit)
        
        if not ohlcv_data or len(ohlcv_data) < 50:  # Need enough data for indicators
            return {
                'bias': 'NEUTRAL',
                'confidence': 0.0,
                'regime': 'UNKNOWN',
                'indicators': {},
                'notes': ['Insufficient data for signal generation']
            }
        
        # Convert to DataFrame for easier manipulation
        df = pd.DataFrame(ohlcv_data)
        df['close'] = pd.to_numeric(df['close'])
        df['high'] = pd.to_numeric(df['high'])
        df['low'] = pd.to_numeric(df['low'])
        df['open'] = pd.to_numeric(df['open'])
        
        # Calculate indicators
        df = self._calculate_indicators(df)
        
        # Generate signals
        signals = self._generate_signals(df)
        
        return signals
    
    def _calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate various technical indicators.
        """
        # RSI (Relative Strength Index)
        df['rsi'] = self._calculate_rsi(df['close'], 14)
        
        # EMAs (Exponential Moving Averages)
        df['ema_20'] = df['close'].ewm(span=20).mean()
        df['ema_50'] = df['close'].ewm(span=50).mean()
        
        # Price relative to EMAs
        df['price_ema20_ratio'] = df['close'] / df['ema_20']
        df['price_ema50_ratio'] = df['close'] / df['ema_50']
        df['ema20_ema50_ratio'] = df['ema_20'] / df['ema_50']
        
        # Volatility (ATR-based)
        df['atr'] = self._calculate_atr(df['high'], df['low'], df['close'], 14)
        df['atr_pct'] = (df['atr'] / df['close']) * 100
        
        # Volatility regime classification
        atr_pct_values = df['atr_pct'].dropna()
        if len(atr_pct_values) > 0:
            low_vol_threshold = atr_pct_values.quantile(0.33)
            high_vol_threshold = atr_pct_values.quantile(0.67)
            
            df['vol_regime'] = 'MED'
            df.loc[df['atr_pct'] < low_vol_threshold, 'vol_regime'] = 'LOW'
            df.loc[df['atr_pct'] > high_vol_threshold, 'vol_regime'] = 'HIGH'
        
        # Momentum
        df['momentum'] = df['close'].pct_change(5)  # 5-period momentum
        
        return df
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate RSI indicator."""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def _calculate_atr(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
        """Calculate Average True Range."""
        high_low = high - low
        high_close = np.abs(high - close.shift())
        low_close = np.abs(low - close.shift())
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        return true_range.rolling(window=period).mean()
    
    def _generate_signals(self, df: pd.DataFrame) -> Dict:
        """
        Generate trading signals based on calculated indicators.
        """
        latest = df.iloc[-1]
        prev = df.iloc[-2] if len(df) > 1 else df.iloc[-1]
        
        # RSI-based bias
        rsi_bias = 'NEUTRAL'
        if latest['rsi'] < 30:
            rsi_bias = 'LONG'  # Oversold
        elif latest['rsi'] > 70:
            rsi_bias = 'SHORT'  # Overbought
        
        # EMA-based bias
        ema_bias = 'NEUTRAL'
        if latest['close'] > latest['ema_20'] and latest['ema_20'] > latest['ema_50']:
            ema_bias = 'LONG'  # Bullish trend
        elif latest['close'] < latest['ema_20'] and latest['ema_20'] < latest['ema_50']:
            ema_bias = 'SHORT'  # Bearish trend
        
        # Momentum bias
        momentum_bias = 'NEUTRAL'
        if latest['momentum'] > 0.02:  # 2% positive momentum
            momentum_bias = 'LONG'
        elif latest['momentum'] < -0.02:  # 2% negative momentum
            momentum_bias = 'SHORT'
        
        # Combine biases
        bias_counts = {'LONG': 0, 'SHORT': 0, 'NEUTRAL': 0}
        for bias in [rsi_bias, ema_bias, momentum_bias]:
            bias_counts[bias] += 1
        
        # Determine overall bias
        if bias_counts['LONG'] > bias_counts['SHORT']:
            overall_bias = 'LONG'
        elif bias_counts['SHORT'] > bias_counts['LONG']:
            overall_bias = 'SHORT'
        else:
            overall_bias = 'NEUTRAL'
        
        # Calculate confidence (simple approach based on indicator agreement)
        agreement_count = max(bias_counts.values())
        confidence = agreement_count / 3.0  # 3 indicators
        
        # Determine regime
        regime = latest.get('vol_regime', 'MED')
        
        # Generate notes
        notes = []
        if latest['rsi'] < 30:
            notes.append(f"RSI oversold ({latest['rsi']:.1f})")
        elif latest['rsi'] > 70:
            notes.append(f"RSI overbought ({latest['rsi']:.1f})")
        
        if latest['close'] > latest['ema_20'] > latest['ema_50']:
            notes.append("Bullish EMA alignment")
        elif latest['close'] < latest['ema_20'] < latest['ema_50']:
            notes.append("Bearish EMA alignment")
        
        notes.append(f"Volatility regime: {regime}")
        
        return {
            'bias': overall_bias,
            'confidence': confidence,
            'regime': regime,
            'indicators': {
                'rsi': float(latest['rsi']) if not pd.isna(latest['rsi']) else None,
                'ema_20': float(latest['ema_20']) if not pd.isna(latest['ema_20']) else None,
                'ema_50': float(latest['ema_50']) if not pd.isna(latest['ema_50']) else None,
                'atr_pct': float(latest['atr_pct']) if not pd.isna(latest['atr_pct']) else None,
                'momentum': float(latest['momentum']) if not pd.isna(latest['momentum']) else None,
            },
            'notes': notes
        }