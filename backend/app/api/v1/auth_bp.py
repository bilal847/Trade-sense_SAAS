from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import AuthService
from app import db

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        result = AuthService.register_user(email, password, first_name, last_name)
        return jsonify(result), 201
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return tokens."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        result = AuthService.login_user(email, password)
        return jsonify(result), 200
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception:
        return jsonify({'error': 'Login failed'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user."""
    try:
        user_id = get_jwt_identity()
        user = AuthService.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict(include_sensitive=False)}), 200
    
    except Exception:
        return jsonify({'error': 'Failed to get user info'}), 500


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = AuthService.update_user_profile(user_id, **data)
        return jsonify({'user': result}), 200
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception:
        return jsonify({'error': 'Failed to update profile'}), 500


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new passwords are required'}), 400
        
        success = AuthService.change_password(user_id, current_password, new_password)
        if success:
            return jsonify({'message': 'Password changed successfully'}), 200
        else:
            return jsonify({'error': 'Failed to change password'}), 500
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception:
        return jsonify({'error': 'Failed to change password'}), 500