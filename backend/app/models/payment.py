from app import db
from app.models.base import BaseModel
from sqlalchemy import String, Boolean, Float, Integer, DateTime, JSON, ForeignKey


class Payment(BaseModel):
    __tablename__ = 'payments'
    
    user_id = db.Column(Integer, db.ForeignKey('users.id'), nullable=False)
    plan = db.Column(String(50), nullable=False)  # 'BASIC', 'PREMIUM', 'PRO'
    amount = db.Column(Float, nullable=False)
    currency = db.Column(String(10), default='USD')
    status = db.Column(String(20), default='PENDING')  # PENDING, COMPLETED, FAILED, REFUNDED
    provider = db.Column(String(20), default='MOCK')  # MOCK, PAYPAL, STRIPE
    provider_transaction_id = db.Column(String(100), nullable=True)
    completed_at = db.Column(DateTime, nullable=True)
    
    def to_dict(self):
        data = super().to_dict()
        return data