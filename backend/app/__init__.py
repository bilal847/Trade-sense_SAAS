import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from app.config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Enable CORS
    CORS(app)

    # Import Blueprints
    from app.api.v1.auth_bp import auth_bp
    from app.api.v1.market_bp import market_bp
    from app.api.v1.challenge_bp import challenge_bp
    from app.api.v1.leaderboard_bp import leaderboard_bp
    from app.api.v1.payment_bp import payment_bp
    from app.api.v1.learning_bp import learning_bp
    from app.api.v1.features_bp import news_bp, quant_bp
    from app.api.v1.admin_bp import admin_bp
    from app.api.swagger import swagger_bp
    
    from flask import Blueprint
    
    # Create API version 1 blueprint
    # This prefixes all routes with /api/v1
    api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')
    
    # Register blueprints to api_v1
    # Note: Some blueprints define their own url_prefix in their file (e.g. /auth, /market)
    # Others might need it here if missing.
    
    api_v1.register_blueprint(auth_bp)        # has /auth in file? Likely yes.
    api_v1.register_blueprint(market_bp)      # has /market
    api_v1.register_blueprint(challenge_bp)   # has /challenges
    api_v1.register_blueprint(leaderboard_bp) # has /leaderboard
    api_v1.register_blueprint(payment_bp)     # has /payment
    api_v1.register_blueprint(learning_bp)    # has /learning
    
    # New features - prefixes explicit just in case
    api_v1.register_blueprint(news_bp, url_prefix='/news')
    api_v1.register_blueprint(quant_bp, url_prefix='/quant')
    api_v1.register_blueprint(admin_bp)
    
    # Register the main API blueprint
    app.register_blueprint(api_v1)
    
    # Register swagger separately
    app.register_blueprint(swagger_bp, url_prefix='/api')

    return app