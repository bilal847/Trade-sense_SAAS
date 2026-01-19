from app import db
from app.models.base import BaseModel
from sqlalchemy import String, Boolean, Float, Integer, DateTime, JSON, ForeignKey


class Trade(BaseModel):
    __tablename__ = 'trades'
    
    user_challenge_id = db.Column(Integer, db.ForeignKey('user_challenges.id'), nullable=False)
    instrument_id = db.Column(Integer, db.ForeignKey('instruments.id'), nullable=False)
    
    side = db.Column(String(10), nullable=False)  # 'BUY' or 'SELL'
    qty = db.Column(Float, nullable=False)
    price = db.Column(Float, nullable=False)
    fee = db.Column(Float, default=0.0)
    realized_pnl = db.Column(Float, default=0.0)
    
    def to_dict(self):
        data = super().to_dict()
        return data