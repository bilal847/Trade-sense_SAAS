import random
import time
import pandas as pd
import numpy as np

class QuantService:
    @staticmethod
    def analyze_instrument(instrument_id: int):
        """
        LEGACY: Simple base model for Dashboard Trading Signals panel.
        Kept as-is for backward compatibility.
        """
        import time
        seed_val = instrument_id + int(time.time() / 3600)
        np.random.seed(seed_val)
        random.seed(seed_val)
        
        current_price = 100 + (instrument_id * 5)
        prices = [current_price]
        for _ in range(100):
            change = np.random.normal(0, 1.5)
            prices.append(max(0.1, prices[-1] + change))
        prices = prices[::-1]
        
        df = pd.Series(prices)
        
        # RSI
        delta = df.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs)).iloc[-1]
        
        # SMA
        sma_50 = df.rolling(window=50).mean().iloc[-1]
        sma_20 = df.rolling(window=20).mean().iloc[-1]
        
        # Decision Logic
        signal = "NEUTRAL"
        reasoning = []
        
        if rsi > 70:
            reasoning.append(f"RSI is Overbought ({rsi:.1f})")
            signal = "SELL"
        elif rsi < 30:
            reasoning.append(f"RSI is Oversold ({rsi:.1f})")
            signal = "BUY"
        else:
            reasoning.append(f"RSI is Neutral ({rsi:.1f})")
            
        if sma_20 > sma_50:
            reasoning.append("Trend is Bullish (Price > SMA50)")
            if signal == "NEUTRAL": signal = "BUY"
        else:
             reasoning.append("Trend is Bearish (Price < SMA50)")
             if signal == "NEUTRAL": signal = "SELL"
             
        return {
            "instrument_id": instrument_id,
            "signal": signal,
            "confidence": f"{random.randint(60, 95)}%",
            "indicators": {
                "rsi": round(rsi, 2),
                "sma_50": round(sma_50, 2),
                "volatility": "High" if np.std(prices) > 2 else "Low"
            },
            "reasoning": ". ".join(reasoning) + "."
        }

    @staticmethod
    def _generate_price_series(instrument_id: int, length: int = 200):
        """Helper to generate consistent price data"""
        import time
        seed_val = instrument_id + int(time.time() / 3600)
        np.random.seed(seed_val)
        
        current_price = 100 + (instrument_id * 5)
        prices = [current_price]
        for _ in range(length):
            change = np.random.normal(0, 1.5)
            prices.append(max(0.1, prices[-1] + change))
        return prices[::-1]

    @staticmethod
    def _base_model(prices):
        """Model 1: Base Technical (RSI + SMA)"""
        df = pd.Series(prices[-100:])
        
        delta = df.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs)).iloc[-1]
        
        sma_50 = df.rolling(window=50).mean().iloc[-1]
        sma_20 = df.rolling(window=20).mean().iloc[-1]
        
        score = 0
        if rsi < 30: score += 2
        elif rsi > 70: score -= 2
        if sma_20 > sma_50: score += 1
        else: score -= 1
        
        signal = "BUY" if score > 0 else ("SELL" if score < 0 else "NEUTRAL")
        confidence = min(abs(score) * 0.25, 0.95)
        
        return {
            "signal": signal,
            "confidence": confidence,
            "reasoning": f"RSI: {rsi:.1f}, SMA20/50 Cross",
            "indicators": {"rsi": round(rsi, 2), "sma_20": round(sma_20, 2), "sma_50": round(sma_50, 2)}
        }

    @staticmethod
    def _macro_model(prices):
        """Model 2: Macro/Horizon (Long-term trends)"""
        df = pd.Series(prices)
        
        sma_200 = df.rolling(window=200).mean().iloc[-1] if len(df) >= 200 else df.mean()
        current = df.iloc[-1]
        
        # Momentum over different horizons
        mom_30 = (df.iloc[-1] - df.iloc[-30]) / df.iloc[-30] if len(df) >= 30 else 0
        mom_60 = (df.iloc[-1] - df.iloc[-60]) / df.iloc[-60] if len(df) >= 60 else 0
        mom_90 = (df.iloc[-1] - df.iloc[-90]) / df.iloc[-90] if len(df) >= 90 else 0
        
        avg_momentum = (mom_30 + mom_60 + mom_90) / 3
        
        score = 0
        if current > sma_200: score += 2
        else: score -= 2
        if avg_momentum > 0.02: score += 1
        elif avg_momentum < -0.02: score -= 1
        
        signal = "BUY" if score > 0 else ("SELL" if score < 0 else "NEUTRAL")
        confidence = min(abs(score) * 0.3, 0.95)
        
        return {
            "signal": signal,
            "confidence": confidence,
            "reasoning": f"Price vs 200SMA, Momentum: {avg_momentum*100:.1f}%",
            "indicators": {"sma_200": round(sma_200, 2), "momentum": round(avg_momentum*100, 2)}
        }

    @staticmethod
    def _quant_model(prices):
        """Model 3: Pure Quant (MACD, Bollinger, Stochastic)"""
        df = pd.Series(prices[-100:])
        
        # MACD
        ema_12 = df.ewm(span=12).mean()
        ema_26 = df.ewm(span=26).mean()
        macd = ema_12 - ema_26
        signal_line = macd.ewm(span=9).mean()
        macd_diff = macd.iloc[-1] - signal_line.iloc[-1]
        
        # Bollinger Bands
        sma_20 = df.rolling(window=20).mean()
        std_20 = df.rolling(window=20).std()
        upper_band = sma_20 + (2 * std_20)
        lower_band = sma_20 - (2 * std_20)
        current = df.iloc[-1]
        
        # Z-Score
        z_score = (current - sma_20.iloc[-1]) / std_20.iloc[-1]
        
        score = 0
        if macd_diff > 0: score += 1
        else: score -= 1
        if z_score < -1.5: score += 2  # Oversold
        elif z_score > 1.5: score -= 2  # Overbought
        
        signal = "BUY" if score > 0 else ("SELL" if score < 0 else "NEUTRAL")
        confidence = min(abs(score) * 0.25, 0.95)
        
        return {
            "signal": signal,
            "confidence": confidence,
            "reasoning": f"MACD: {macd_diff:.2f}, Z-Score: {z_score:.2f}",
            "indicators": {"macd": round(macd_diff, 2), "z_score": round(z_score, 2)}
        }

    @staticmethod
    def _volatility_model(prices):
        """Model 4: Volatility/Risk Clustering (GARCH-style, ATR)"""
        df = pd.Series(prices[-100:])
        
        # Returns
        returns = df.pct_change().dropna()
        
        # Rolling volatility (GARCH proxy)
        vol_short = returns.rolling(window=10).std().iloc[-1]
        vol_long = returns.rolling(window=30).std().iloc[-1]
        
        # ATR proxy (using price std)
        atr = df.rolling(window=14).std().iloc[-1]
        
        # Volatility clustering detection
        vol_ratio = vol_short / vol_long if vol_long > 0 else 1
        
        score = 0
        # In high vol, favor mean reversion
        if vol_ratio > 1.5:  # High volatility cluster
            # Check if price is extreme
            z = (df.iloc[-1] - df.mean()) / df.std()
            if z < -1: score += 2  # Oversold in high vol
            elif z > 1: score -= 2  # Overbought in high vol
        else:  # Low vol, favor trend
            if df.iloc[-1] > df.rolling(window=20).mean().iloc[-1]: score += 1
            else: score -= 1
        
        signal = "BUY" if score > 0 else ("SELL" if score < 0 else "NEUTRAL")
        confidence = min(abs(score) * 0.3, 0.95)
        
        return {
            "signal": signal,
            "confidence": confidence,
            "reasoning": f"Vol Ratio: {vol_ratio:.2f}, ATR: {atr:.2f}",
            "indicators": {"vol_ratio": round(vol_ratio, 2), "atr": round(atr, 2)}
        }

    @staticmethod
    def _calculate_dynamic_weights(prices):
        """Calculate model weights based on market regime"""
        df = pd.Series(prices[-100:])
        
        # Volatility level
        returns = df.pct_change().dropna()
        vol = returns.std()
        vol_percentile = 0.7 if vol > 0.03 else (0.3 if vol < 0.01 else 0.5)
        
        # Trend strength
        sma_20 = df.rolling(window=20).mean().iloc[-1]
        sma_50 = df.rolling(window=50).mean().iloc[-1]
        trend_strength = abs(sma_20 - sma_50) / sma_50 if sma_50 > 0 else 0
        trend_percentile = 0.8 if trend_strength > 0.05 else (0.2 if trend_strength < 0.01 else 0.5)
        
        # Dynamic weighting
        if vol_percentile > 0.6:  # High volatility
            weights = [0.2, 0.2, 0.2, 0.4]  # Favor volatility model
        elif trend_percentile > 0.7:  # Strong trend
            weights = [0.2, 0.4, 0.2, 0.2]  # Favor macro model
        else:  # Range-bound
            weights = [0.25, 0.25, 0.25, 0.25]  # Equal weight
        
        return weights

    @staticmethod
    def analyze_instrument_ensemble(instrument_id: int):
        """
        NEW: Multi-model ensemble analysis for AI Quant Assistant.
        Returns aggregated signal with model breakdown.
        """
        # Generate price series
        prices = QuantService._generate_price_series(instrument_id, 200)
        
        # Run all 4 models
        base = QuantService._base_model(prices)
        macro = QuantService._macro_model(prices)
        quant = QuantService._quant_model(prices)
        volatility = QuantService._volatility_model(prices)
        
        models = [base, macro, quant, volatility]
        model_names = ["Base Technical", "Macro/Horizon", "Pure Quant", "Volatility/Risk"]
        
        # Calculate dynamic weights
        weights = QuantService._calculate_dynamic_weights(prices)
        
        # Ensemble aggregation
        signal_scores = {"BUY": 0, "SELL": 0, "NEUTRAL": 0}
        weighted_confidence = 0
        
        for i, model in enumerate(models):
            signal_scores[model["signal"]] += weights[i] * model["confidence"]
            weighted_confidence += weights[i] * model["confidence"]
        
        # Final signal
        final_signal = max(signal_scores, key=signal_scores.get)
        final_confidence = int(weighted_confidence * 100)
        
        # Build breakdown
        breakdown = []
        for i, (model, name) in enumerate(zip(models, model_names)):
            breakdown.append({
                "name": name,
                "signal": model["signal"],
                "confidence": int(model["confidence"] * 100),
                "weight": int(weights[i] * 100),
                "reasoning": model["reasoning"],
                "indicators": model["indicators"]
            })
        
        return {
            "instrument_id": instrument_id,
            "signal": final_signal,
            "confidence": f"{final_confidence}%",
            "ensemble_breakdown": breakdown,
            "reasoning": f"Ensemble of 4 models with dynamic weighting. Consensus: {final_signal}"
        }
