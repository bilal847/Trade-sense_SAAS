import os
from app import create_app, db
from app.models import User, Instrument, Challenge
from app import bcrypt
from datetime import datetime


def create_default_data():
    """Create default data for the application."""
    from app.models import User, Instrument, Challenge
    
    # Create default challenge if none exists
    if not Challenge.query.first():
        default_challenge = Challenge(
            name="Standard Challenge",
            description="Standard prop firm challenge with 10k balance",
            start_balance=10000.0,
            daily_max_loss=0.05,  # 5% daily max loss
            total_max_loss=0.10,  # 10% total max loss
            profit_target=0.10,   # 10% profit target
            is_active=True
        )
        db.session.add(default_challenge)
        db.session.commit()
        print("Created default challenge")
    
    # Create default instruments
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
    
    # Add or update instruments to database
    for instr in all_instruments_data:
        instrument = Instrument.query.filter_by(display_symbol=instr['symbol']).first()
        if instrument:
            # Update existing
            instrument.name = instr['name']
            instrument.provider_symbol = instr['symbol']
            instrument.provider = instr['provider']
            instrument.exchange = instr['exchange']
            instrument.currency = instr['currency']
            instrument.asset_class = instr['asset_class']
            instrument.active = True
        else:
            # Create new
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
    
    # Create demo user if none exists
    if not User.find_by_email('demo@tradesense.com'):
        demo_user = User(
            email='demo@tradesense.com',
            password_hash=bcrypt.generate_password_hash('DemoPassword123!').decode('utf-8'),
            first_name='Demo',
            last_name='User',
            is_active=True,
            is_verified=True,
            role='user'
        )
        db.session.add(demo_user)
        print("Created demo user")

    # Create admin user if none exists
    if not User.find_by_email('admin@tradesense.com'):
        admin_user = User(
            email='admin@tradesense.com',
            password_hash=bcrypt.generate_password_hash('Admin123!').decode('utf-8'),
            first_name='Admin',
            last_name='User',
            is_active=True,
            is_verified=True,
            role='admin'
        )
        db.session.add(admin_user)
        print("Created admin user")

    # Create superadmin user if none exists
    if not User.find_by_email('super@tradesense.com'):
        super_user = User(
            email='super@tradesense.com',
            password_hash=bcrypt.generate_password_hash('Super123!').decode('utf-8'),
            first_name='Super',
            last_name='Admin',
            is_active=True,
            is_verified=True,
            role='superadmin'
        )
        db.session.add(super_user)
        print("Created superadmin user")
    
    db.session.commit()


if __name__ == "__main__":
    app = create_app()
    
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        # Create default data
        create_default_data()
    
    # Run the application
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)