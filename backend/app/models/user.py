from datetime import datetime
from app import db, bcrypt
from app.models.base import BaseModel
from sqlalchemy import func


class User(BaseModel):
    __tablename__ = 'users'
    
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(20), default='user', nullable=False)  # user, admin, superadmin
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Suspension information
    suspension_type = db.Column(db.String(20), nullable=True)  # TEMPORARY, PERMANENT
    suspension_end = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user_challenges = db.relationship('UserChallenge', backref='user', lazy=True, cascade='all, delete-orphan')
    watchlists = db.relationship('Watchlist', backref='user', lazy=True, cascade='all, delete-orphan')
    quiz_attempts = db.relationship('QuizAttempt', backref='user', lazy=True, cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='user', lazy=True, cascade='all, delete-orphan')
    learning_progress = db.relationship('LearningProgress', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive=False):
        data = super().to_dict()
        if not include_sensitive:
            data.pop('password_hash', None)
        return data
    
    @classmethod
    def find_by_email(cls, email):
        return cls.query.filter(func.lower(cls.email) == func.lower(email)).first()