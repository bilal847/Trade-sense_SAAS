from app import db
from app.models.base import BaseModel
from sqlalchemy import String, Boolean, Float, Integer, DateTime, JSON


class Instrument(BaseModel):
    __tablename__ = 'instruments'
    
    asset_class = db.Column(String(20), nullable=False)  # 'FX', 'CRYPTO', 'STOCK'
    display_symbol = db.Column(String(20), nullable=False, index=True)
    provider = db.Column(String(20), nullable=False)  # 'BINANCE', 'MT5', 'MOROCCO'
    provider_symbol = db.Column(String(20), nullable=False)
    exchange = db.Column(String(50), nullable=True)
    currency = db.Column(String(10), nullable=False)
    active = db.Column(Boolean, default=True)
    min_qty = db.Column(Float, default=0.01)
    max_qty = db.Column(Float, default=1000000.0)
    tick_size = db.Column(Float, default=0.00001)
    metadata_json = db.Column(JSON, nullable=True)  # Additional provider-specific metadata
    
    # Relationships
    positions = db.relationship('Position', backref='instrument', lazy=True)
    trades = db.relationship('Trade', backref='instrument', lazy=True)
    watchlist_items = db.relationship('WatchlistItem', backref='instrument', lazy=True, cascade='all, delete-orphan')
    equity_snapshots = db.relationship('EquitySnapshot', backref='instrument', lazy=True)
    
    def to_dict(self):
        data = super().to_dict()
        return data