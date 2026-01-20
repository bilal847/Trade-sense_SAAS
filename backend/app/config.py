import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'tradesense-quant-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///tradesense.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Market Data Provider Configurations
    MT5_SERVER = os.environ.get('MT5_SERVER', 'MetaQuotes-Demo')
    MT5_LOGIN = os.environ.get('MT5_LOGIN')
    MT5_PASSWORD = os.environ.get('MT5_PASSWORD')
    MT5_PATH = os.environ.get('MT5_PATH', r'C:\Program Files\MetaTrader 5\terminal64.exe')
    
    # Redis Configuration (optional)
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    
    # Cache TTLs (in seconds)
    QUOTE_CACHE_TTL = int(os.environ.get('QUOTE_CACHE_TTL', 1))  # 1 second
    OHLCV_CACHE_TTL = int(os.environ.get('OHLCV_CACHE_TTL', 60))  # 60 seconds
    
    # Timezone
    TIMEZONE = os.environ.get('TIMEZONE', 'Africa/Casablanca')
    
    # Feature flags
    PAYMENT_ENABLED = os.environ.get('PAYMENT_ENABLED', 'false').lower() == 'true'