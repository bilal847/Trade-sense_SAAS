from flask import Blueprint

# Main API Blueprint
bp = Blueprint('api', __name__)

from app.api.v1 import auth_bp, market_bp, challenge_bp, leaderboard_bp, payment_bp, learning_bp


# Register version 1 blueprints
def init_app(app):
    app.register_blueprint(bp, url_prefix='/api/v1')
    app.register_blueprint(auth_bp)
    app.register_blueprint(market_bp)
    app.register_blueprint(challenge_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(learning_bp)