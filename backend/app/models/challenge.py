from app import db
from app.models.base import BaseModel
from sqlalchemy import String, Boolean, Float, Integer, DateTime, JSON
from datetime import datetime


class Challenge(BaseModel):
    __tablename__ = 'challenges'
    
    name = db.Column(String(100), nullable=False)
    description = db.Column(String(500), nullable=True)
    start_balance = db.Column(Float, nullable=False, default=10000.0)
    daily_max_loss = db.Column(Float, nullable=False, default=0.05)  # 5%
    total_max_loss = db.Column(Float, nullable=False, default=0.10)  # 10%
    profit_target = db.Column(Float, nullable=False, default=0.10)  # 10%
    max_duration_days = db.Column(Integer, nullable=True)  # None means no time limit
    is_active = db.Column(Boolean, default=True)
    rules_json = db.Column(JSON, nullable=True)  # Additional challenge-specific rules
    
    # Relationships
    user_challenges = db.relationship('UserChallenge', backref='challenge', lazy=True)
    
    def to_dict(self):
        data = super().to_dict()
        return data


class UserChallenge(BaseModel):
    __tablename__ = 'user_challenges'
    
    user_id = db.Column(Integer, db.ForeignKey('users.id'), nullable=False)
    challenge_id = db.Column(Integer, db.ForeignKey('challenges.id'), nullable=False)
    
    status = db.Column(String(20), default='IN_PROGRESS')  # IN_PROGRESS, PASSED, FAILED
    start_balance = db.Column(Float, nullable=False)
    start_time = db.Column(DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(DateTime, nullable=True)
    daily_start_equity = db.Column(Float, default=0.0)  # Equity at start of current day
    current_equity = db.Column(Float, default=0.0)
    max_equity = db.Column(Float, default=0.0)
    min_equity = db.Column(Float, default=float('inf'))
    min_equity_all_time = db.Column(Float, default=float('inf'))
    min_equity_today = db.Column(Float, default=float('inf'))
    last_eval_at = db.Column(DateTime, nullable=True)
    stats_json = db.Column(JSON, nullable=True)  # Additional stats
    
    # Rule violations and flagging
    violated_rules = db.Column(JSON, nullable=True)  # List of strings e.g. ["Max Daily Drawdown"]
    flagged_by_admin = db.Column(Boolean, default=False)
    
    # Relationships
    positions = db.relationship('Position', backref='user_challenge', lazy=True, cascade='all, delete-orphan')
    trades = db.relationship('Trade', backref='user_challenge', lazy=True, cascade='all, delete-orphan')
    equity_snapshots = db.relationship('EquitySnapshot', backref='user_challenge', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        data = super().to_dict()
        # Add calculated fields
        data['daily_drawdown'] = (self.daily_start_equity - self.min_equity_today) / self.daily_start_equity if self.daily_start_equity > 0 else 0
        data['total_drawdown'] = (self.start_balance - self.min_equity_all_time) / self.start_balance if self.start_balance > 0 else 0
        data['profit_percentage'] = (self.current_equity - self.start_balance) / self.start_balance if self.start_balance > 0 else 0
        return data