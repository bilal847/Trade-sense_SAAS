from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.user import User


def require_role(*allowed_roles):
    """
    Decorator to require specific user roles.
    Usage: @require_role('admin', 'superadmin')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                user_id = get_jwt_identity()
                user = User.query.get(user_id)
                
                if not user:
                    return jsonify({'error': 'User not found'}), 401
                
                if user.role not in allowed_roles:
                    return jsonify({'error': 'Insufficient permissions'}), 403
                
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': 'Authorization failed'}), 401
        
        return wrapper
    return decorator
