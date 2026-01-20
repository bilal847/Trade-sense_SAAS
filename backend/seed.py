"""
Seed script for TradeSense Quant database
This script creates initial data for the application.
"""

import os
import sys
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Set up Flask app context
from app import create_app, db
from app.models import User, Instrument, Challenge, LearningModule, LearningLesson
from app import bcrypt


def seed_database():
    app = create_app()
    
    with app.app_context():
        print("Creating tables...")
        db.create_all()
        print("Starting database seeding...")
        
        # Create default challenge if none exists
        if not Challenge.query.first():
            default_challenge = Challenge(
                name="Standard Challenge",
                description="Standard prop firm challenge with 10k balance",
                start_balance=10000.0,
                daily_max_loss=0.05,  # 5% daily max loss
                total_max_loss=0.10,  # 10% total max loss
                profit_target=0.10,   # 10% profit target
                max_trade_quantity=5.0, # 5 units per trade limit
                is_active=True
            )
            db.session.add(default_challenge)
            db.session.commit()
            print("Created default challenge")
        
        # Create default instruments if none exist
        if not Instrument.query.first():
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
            
            # Casablanca Stock Exchange instruments (Morocco)
            cse_instruments = [
                {'symbol': 'IAM', 'name': 'Itissalat Al-Maghrib (Maroc Telecom)', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCK'},
                {'symbol': 'ING', 'name': 'Insurance Company', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCK'},
                {'symbol': 'MNG', 'name': 'Managem', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCK'},
                {'symbol': 'WAF', 'name': 'Wafa Assurance', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCK'},
                {'symbol': 'BCP', 'name': 'Banque Centrale Populaire', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCK'},
                {'symbol': 'CIH', 'name': 'Credit Immobilier et Hotelier', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCK'},
                {'symbol': 'ATT', 'name': 'Attijariwafa Bank', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCK'},
                {'symbol': 'MOR', 'name': 'Morocco Sovereign Fund', 'provider': 'MOROCCO', 'exchange': 'CSE', 'currency': 'MAD', 'asset_class': 'STOCK'},
            ]
            
            # Combine all instruments
            all_instruments = []
            all_instruments.extend(crypto_instruments)
            all_instruments.extend(fx_instruments)
            all_instruments.extend(cse_instruments)
            
            # Add instruments to database
            for instr in all_instruments:
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
            print(f"Created {len(all_instruments)} instruments")
        
        # Create demo user if none exists
        if not User.query.first():
            demo_user = User(
                email='demo@tradesense.com',
                password_hash=bcrypt.generate_password_hash('DemoPassword123!').decode('utf-8'),
                first_name='Demo',
                last_name='User',
                role='user',
                is_active=True,
                is_verified=True
            )
            db.session.add(demo_user)
            
            # Create admin user
            admin_user = User(
                email='admin@tradesense.com',
                password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8'),
                first_name='Admin',
                last_name='User',
                role='admin',
                is_active=True,
                is_verified=True
            )
            db.session.add(admin_user)
            
            # Create superadmin user
            superadmin_user = User(
                email='super@tradesense.com',
                password_hash=bcrypt.generate_password_hash('super123').decode('utf-8'),
                first_name='Super',
                last_name='Admin',
                role='superadmin',
                is_active=True,
                is_verified=True
            )
            db.session.add(superadmin_user)
            
            db.session.commit()
            print("Created demo, admin, and superadmin users")
        
        print("Database seeding completed successfully!")


if __name__ == "__main__":
    seed_database()