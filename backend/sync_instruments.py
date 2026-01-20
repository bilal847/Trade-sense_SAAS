import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from app import create_app, db
from app.models import Instrument

app = create_app()

def sync_instruments():
    with app.app_context():
        # Crypto instruments (Binance)
        crypto_instruments = [
            {'symbol': 'BTCUSDT', 'name': 'Bitcoin', 'provider': 'BINANCE', 'exchange': 'Binance', 'currency': 'USDT', 'asset_class': 'CRYPTO'},
            {'symbol': 'ETHUSDT', 'name': 'Ethereum', 'provider': 'BINANCE', 'exchange': 'Binance', 'currency': 'USDT', 'asset_class': 'CRYPTO'},
            {'symbol': 'XRPUSDT', 'name': 'Ripple', 'provider': 'BINANCE', 'exchange': 'Binance', 'currency': 'USDT', 'asset_class': 'CRYPTO'},
            {'symbol': 'ADAUSDT', 'name': 'Cardano', 'provider': 'BINANCE', 'exchange': 'Binance', 'currency': 'USDT', 'asset_class': 'CRYPTO'},
            {'symbol': 'SOLUSDT', 'name': 'Solana', 'provider': 'BINANCE', 'exchange': 'Binance', 'currency': 'USDT', 'asset_class': 'CRYPTO'},
            {'symbol': 'DOTUSDT', 'name': 'Polkadot', 'provider': 'BINANCE', 'exchange': 'Binance', 'currency': 'USDT', 'asset_class': 'CRYPTO'},
            {'symbol': 'LINKUSDT', 'name': 'Chainlink', 'provider': 'BINANCE', 'exchange': 'Binance', 'currency': 'USDT', 'asset_class': 'CRYPTO'},
            {'symbol': 'MATICUSDT', 'name': 'Polygon', 'provider': 'BINANCE', 'exchange': 'Binance', 'currency': 'USDT', 'asset_class': 'CRYPTO'},
        ]
        
        # FX instruments (MT5)
        fx_instruments = [
            {'symbol': 'EURUSD', 'name': 'Euro vs US Dollar', 'provider': 'MT5', 'exchange': 'Forex', 'currency': 'USD', 'asset_class': 'FX'},
            {'symbol': 'GBPUSD', 'name': 'British Pound vs US Dollar', 'provider': 'MT5', 'exchange': 'Forex', 'currency': 'USD', 'asset_class': 'FX'},
            {'symbol': 'USDJPY', 'name': 'US Dollar vs Japanese Yen', 'provider': 'MT5', 'exchange': 'Forex', 'currency': 'JPY', 'asset_class': 'FX'},
            {'symbol': 'USDCHF', 'name': 'US Dollar vs Swiss Franc', 'provider': 'MT5', 'exchange': 'Forex', 'currency': 'CHF', 'asset_class': 'FX'},
            {'symbol': 'AUDUSD', 'name': 'Australian Dollar vs US Dollar', 'provider': 'MT5', 'exchange': 'Forex', 'currency': 'USD', 'asset_class': 'FX'},
            {'symbol': 'USDCAD', 'name': 'US Dollar vs Canadian Dollar', 'provider': 'MT5', 'exchange': 'Forex', 'currency': 'CAD', 'asset_class': 'FX'},
            {'symbol': 'NZDUSD', 'name': 'New Zealand Dollar vs US Dollar', 'provider': 'MT5', 'exchange': 'Forex', 'currency': 'USD', 'asset_class': 'FX'},
            {'symbol': 'EURJPY', 'name': 'Euro vs Japanese Yen', 'provider': 'MT5', 'exchange': 'Forex', 'currency': 'JPY', 'asset_class': 'FX'},
        ]

        # Commodities (MT5)
        commodity_instruments = [
            {'symbol': 'XAUUSD', 'name': 'Gold (Spot)', 'provider': 'MT5', 'exchange': 'Commodities', 'currency': 'USD', 'asset_class': 'COMMODITIES'},
            {'symbol': 'XAGUSD', 'name': 'Silver (Spot)', 'provider': 'MT5', 'exchange': 'Commodities', 'currency': 'USD', 'asset_class': 'COMMODITIES'},
            {'symbol': 'BRENT', 'name': 'Brent Crude Oil', 'provider': 'MT5', 'exchange': 'Commodities', 'currency': 'USD', 'asset_class': 'COMMODITIES'},
            {'symbol': 'WTI', 'name': 'WTI Crude Oil', 'provider': 'MT5', 'exchange': 'Commodities', 'currency': 'USD', 'asset_class': 'COMMODITIES'},
        ]
        
        # Casablanca Stock Exchange instruments (Morocco)
        cse_instruments = [
            {'symbol': 'IAM', 'name': 'Itissalat Al-Maghrib (Maroc Telecom)', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCKS'},
            {'symbol': 'ING', 'name': 'Insurance Company', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCKS'},
            {'symbol': 'MNG', 'name': 'Managem', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCKS'},
            {'symbol': 'WAF', 'name': 'Wafa Assurance', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCKS'},
            {'symbol': 'BCP', 'name': 'Banque Centrale Populaire', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCKS'},
            {'symbol': 'CIH', 'name': 'Credit Immobilier et Hotelier', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCKS'},
            {'symbol': 'ATT', 'name': 'Attijariwafa Bank', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCKS'},
            {'symbol': 'MOR', 'name': 'Morocco Sovereign Fund', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCKS'},
        ]
        
        # Combine all instruments
        all_instruments_data = []
        all_instruments_data.extend(crypto_instruments)
        all_instruments_data.extend(fx_instruments)
        all_instruments_data.extend(commodity_instruments)
        all_instruments_data.extend(cse_instruments)
        
        for instr in all_instruments_data:
            instrument = Instrument.query.filter_by(display_symbol=instr['symbol']).first()
            if instrument:
                instrument.name = instr['name']
                instrument.provider_symbol = instr['symbol']
                instrument.provider = instr['provider']
                instrument.exchange = instr['exchange']
                instrument.currency = instr['currency']
                instrument.asset_class = instr['asset_class']
                instrument.active = True
            else:
                instrument = Instrument(
                    display_symbol=instr['symbol'],
                    provider_symbol=instr['symbol'],
                    provider=instr['provider'],
                    exchange=instr['exchange'],
                    currency=instr['currency'],
                    asset_class=instr['asset_class'],
                    active=True
                )
                db.session.add(instrument)
        
        db.session.commit()
        print(f"Synchronized {len(all_instruments_data)} instruments")

if __name__ == "__main__":
    sync_instruments()
