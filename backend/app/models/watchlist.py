from app import db
from app.models.base import BaseModel
from sqlalchemy import String, Boolean, Float, Integer, DateTime, JSON, ForeignKey


class Watchlist(BaseModel):
    __tablename__ = 'watchlists'
    
    user_id = db.Column(Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(String(100), nullable=False)
    
    # Relationships
    items = db.relationship('WatchlistItem', backref='watchlist', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        data = super().to_dict()
        return data


class WatchlistItem(BaseModel):
    __tablename__ = 'watchlist_items'
    
    watchlist_id = db.Column(Integer, db.ForeignKey('watchlists.id'), nullable=False)
    instrument_id = db.Column(Integer, db.ForeignKey('instruments.id'), nullable=False)
    
    def to_dict(self):
        data = super().to_dict()
        return data