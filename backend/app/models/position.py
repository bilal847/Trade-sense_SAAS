from app import db
from app.models.base import BaseModel
from sqlalchemy import String, Boolean, Float, Integer, DateTime, JSON, ForeignKey


class Position(BaseModel):
    __tablename__ = 'positions'
    
    user_challenge_id = db.Column(Integer, ForeignKey('user_challenges.id'), nullable=False)
    instrument_id = db.Column(Integer, ForeignKey('instruments.id'), nullable=False)
    
    side = db.Column(String(10), nullable=False)  # 'LONG' or 'SHORT'
    qty = db.Column(Float, nullable=False)
    avg_price = db.Column(Float, nullable=False)
    opened_at = db.Column(DateTime, nullable=False)
    
    def to_dict(self):
        data = super().to_dict()
        return data