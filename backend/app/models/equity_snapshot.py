from app import db
from app.models.base import BaseModel
from sqlalchemy import String, Boolean, Float, Integer, DateTime, JSON, ForeignKey


class EquitySnapshot(BaseModel):
    __tablename__ = 'equity_snapshots'
    
    user_challenge_id = db.Column(Integer, db.ForeignKey('user_challenges.id'), nullable=False)
    instrument_id = db.Column(Integer, db.ForeignKey('instruments.id'), nullable=True)  # Optional, for instrument-specific snapshots
    
    equity = db.Column(Float, nullable=False)
    balance = db.Column(Float, nullable=False)
    unrealized_pnl = db.Column(Float, nullable=False)
    ts = db.Column(DateTime, nullable=False)
    
    def to_dict(self):
        data = super().to_dict()
        return data