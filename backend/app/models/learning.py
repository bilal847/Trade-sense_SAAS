from app import db
from app.models.base import BaseModel
from sqlalchemy import String, Boolean, Float, Integer, DateTime, JSON, ForeignKey, Text


class LearningModule(BaseModel):
    __tablename__ = 'learning_modules'
    
    title = db.Column(String(200), nullable=False)
    description = db.Column(String(500), nullable=True)
    order = db.Column(Integer, default=0)
    is_active = db.Column(Boolean, default=True)
    
    # Relationships
    lessons = db.relationship('LearningLesson', backref='module', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        data = super().to_dict()
        return data


class LearningLesson(BaseModel):
    __tablename__ = 'learning_lessons'
    
    module_id = db.Column(Integer, db.ForeignKey('learning_modules.id'), nullable=False)
    title = db.Column(String(200), nullable=False)
    content = db.Column(Text, nullable=True)
    order = db.Column(Integer, default=0)
    lesson_type = db.Column(String(50), default='text')  # 'text', 'video', 'quiz'
    
    # Relationships
    quizzes = db.relationship('Quiz', backref='lesson', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        data = super().to_dict()
        return data


class Quiz(BaseModel):
    __tablename__ = 'quizzes'
    
    lesson_id = db.Column(Integer, db.ForeignKey('learning_lessons.id'), nullable=False)
    question = db.Column(String(500), nullable=False)
    options_json = db.Column(JSON, nullable=False)  # Array of options
    correct_answer = db.Column(String(100), nullable=False)
    explanation = db.Column(String(1000), nullable=True)
    
    # Relationships
    attempts = db.relationship('QuizAttempt', backref='quiz', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        data = super().to_dict()
        return data


class QuizAttempt(BaseModel):
    __tablename__ = 'quiz_attempts'
    
    user_id = db.Column(Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(Integer, db.ForeignKey('quizzes.id'), nullable=False)
    selected_answer = db.Column(String(100), nullable=False)
    is_correct = db.Column(Boolean, nullable=False)
    score = db.Column(Float, nullable=True)
    
    def to_dict(self):
        data = super().to_dict()
        return data


class LearningProgress(BaseModel):
    __tablename__ = 'learning_progress'
    
    user_id = db.Column(Integer, db.ForeignKey('users.id'), nullable=False)
    module_id = db.Column(Integer, db.ForeignKey('learning_modules.id'), nullable=False)
    lesson_id = db.Column(Integer, db.ForeignKey('learning_lessons.id'), nullable=True)
    completed = db.Column(Boolean, default=False)
    progress_percentage = db.Column(Float, default=0.0)
    
    def to_dict(self):
        data = super().to_dict()
        return data