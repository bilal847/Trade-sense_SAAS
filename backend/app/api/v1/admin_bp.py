from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.decorators import require_role
from app.models.user import User
from app.models.challenge import Challenge, UserChallenge
from app import db
import logging

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
logger = logging.getLogger(__name__)


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@require_role('admin', 'superadmin')
def get_users():
    """Get all users (admin/superadmin only)"""
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify({
            'users': [
                {
                    'id': u.id,
                    'email': u.email,
                    'first_name': u.first_name,
                    'last_name': u.last_name,
                    'role': u.role,
                    'is_active': u.is_active,
                    'created_at': u.created_at.isoformat() if u.created_at else None
                }
                for u in users
            ]
        }), 200
    except Exception as e:
        logger.error(f"Admin get_users error: {e}")
        return jsonify({'error': 'Failed to fetch users'}), 500


@admin_bp.route('/users/<int:user_id>/challenges', methods=['GET'])
@jwt_required()
@require_role('admin', 'superadmin')
def get_user_challenges(user_id):
    """Get all challenges for a specific user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        challenges = UserChallenge.query.filter_by(user_id=user_id).order_by(UserChallenge.created_at.desc()).all()
        
        return jsonify({
            'challenges': [
                {
                    'id': uc.id,
                    'challenge_id': uc.challenge_id,
                    'tier': uc.tier if hasattr(uc, 'tier') else None,
                    'start_balance': float(uc.start_balance) if uc.start_balance else None,
                    'current_equity': float(uc.current_equity) if uc.current_equity else None,
                    'status': uc.status,
                    'created_at': uc.created_at.isoformat() if uc.created_at else None
                }
                for uc in challenges
            ]
        }), 200
    except Exception as e:
        logger.error(f"Admin get_user_challenges error: {e}")
        return jsonify({'error': 'Failed to fetch user challenges'}), 500


@admin_bp.route('/user-challenges/<int:uc_id>/status', methods=['POST'])
@jwt_required()
@require_role('admin', 'superadmin')
def update_challenge_status(uc_id):
    """Update user challenge status to PASSED or FAILED"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['PASSED', 'FAILED']:
            return jsonify({'error': 'Status must be PASSED or FAILED'}), 400
        
        uc = UserChallenge.query.get(uc_id)
        if not uc:
            return jsonify({'error': 'User challenge not found'}), 404
        
        old_status = uc.status
        uc.status = new_status
        db.session.commit()
        
        logger.info(f"Admin updated UserChallenge {uc_id} status from {old_status} to {new_status}")
        
        return jsonify({
            'message': 'Status updated successfully',
            'challenge': {
                'id': uc.id,
                'status': uc.status
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Admin update_challenge_status error: {e}")
        return jsonify({'error': 'Failed to update status'}), 500


@admin_bp.route('/users/<int:user_id>/role', methods=['POST'])
@jwt_required()
@require_role('superadmin')
def update_user_role(user_id):
    """Update user role (superadmin only)"""
    try:
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['user', 'admin', 'superadmin']:
            return jsonify({'error': 'Invalid role'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        old_role = user.role
        user.role = new_role
        db.session.commit()
        
        logger.info(f"Superadmin updated User {user_id} ({user.email}) role from {old_role} to {new_role}")
        
        return jsonify({
            'message': 'Role updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Admin update_user_role error: {e}")
        return jsonify({'error': 'Failed to update role'}), 500


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@require_role('superadmin')
def delete_user(user_id):
    """Delete a user (superadmin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.role == 'superadmin':
            return jsonify({'error': 'Cannot delete a superadmin'}), 400
            
        db.session.delete(user)
        db.session.commit()
        
        logger.info(f"Superadmin deleted User {user_id} ({user.email})")
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Admin delete_user error: {e}")
        return jsonify({'error': 'Failed to delete user'}), 500


@admin_bp.route('/users/<int:user_id>/active', methods=['POST'])
@jwt_required()
@require_role('admin', 'superadmin')
def toggle_user_active(user_id):
    """Toggle user active status"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        user.is_active = not user.is_active
        db.session.commit()
        
        status = "activated" if user.is_active else "deactivated"
        logger.info(f"Admin {status} User {user_id} ({user.email})")
        return jsonify({
            'message': f'User {status} successfully',
            'is_active': user.is_active
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Admin toggle_user_active error: {e}")
        return jsonify({'error': 'Failed up update user status'}), 500


@admin_bp.route('/user-challenges/<int:uc_id>/reset', methods=['POST'])
@jwt_required()
@require_role('admin', 'superadmin')
def reset_challenge(uc_id):
    """Reset challenge statistics and equity"""
    try:
        uc = UserChallenge.query.get(uc_id)
        if not uc:
            return jsonify({'error': 'Challenge not found'}), 404
            
        uc.current_equity = uc.start_balance
        uc.daily_start_equity = uc.start_balance
        uc.max_equity = uc.start_balance
        uc.min_equity = uc.start_balance
        uc.min_equity_all_time = uc.start_balance
        uc.min_equity_today = uc.start_balance
        uc.status = 'IN_PROGRESS'
        
        db.session.commit()
        
        logger.info(f"Admin reset UserChallenge {uc_id}")
        return jsonify({
            'message': 'Challenge reset successfully',
            'challenge': uc.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Admin reset_challenge error: {e}")
        return jsonify({'error': 'Failed to reset challenge'}), 500
