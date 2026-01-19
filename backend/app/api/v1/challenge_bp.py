from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import ChallengeService
from app.models import Challenge, UserChallenge, Instrument
from app import db

challenge_bp = Blueprint('challenge', __name__, url_prefix='/challenges')
challenge_service = ChallengeService()


@challenge_bp.route('', methods=['GET'])
def get_challenges():
    """Get all available challenges."""
    try:
        # Get challenges that are active
        challenges = Challenge.query.filter_by(is_active=True).all()
        
        return jsonify({
            'challenges': [challenge.to_dict() for challenge in challenges],
            'total': len(challenges)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@challenge_bp.route('/start', methods=['POST'])
@jwt_required()
def start_challenge():
    """Start a new challenge."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        challenge_id = data.get('challenge_id')
        
        if not challenge_id:
            return jsonify({'error': 'challenge_id is required'}), 400
        
        result = challenge_service.start_challenge(user_id, challenge_id)
        
        return jsonify({
            'message': 'Challenge started successfully',
            'user_challenge': result.to_dict()
        }), 201
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@challenge_bp.route('/<int:user_challenge_id>', methods=['GET'])
@jwt_required()
def get_user_challenge(user_challenge_id):
    """Get details of a specific user challenge."""
    try:
        user_id = get_jwt_identity()
        
        # Verify that the user owns this challenge
        user_challenge = UserChallenge.query.filter_by(
            id=user_challenge_id,
            user_id=user_id
        ).first()
        
        if not user_challenge:
            return jsonify({'error': 'Challenge not found or access denied'}), 404
        
        # Evaluate the challenge to get current status
        evaluation = challenge_service.evaluate_challenge(user_challenge)
        
        return jsonify({
            'user_challenge': user_challenge.to_dict(),
            'evaluation': evaluation
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@challenge_bp.route('/<int:user_challenge_id>/trade', methods=['POST'])
@jwt_required()
def execute_trade(user_challenge_id):
    """Execute a market order for a user challenge."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Verify that the user owns this challenge
        user_challenge = UserChallenge.query.filter_by(
            id=user_challenge_id,
            user_id=user_id
        ).first()
        
        if not user_challenge:
            return jsonify({'error': 'Challenge not found or access denied'}), 404
        
        instrument_id = data.get('instrument_id')
        side = data.get('side')
        qty = data.get('qty')
        
        if not all([instrument_id, side, qty]):
            return jsonify({'error': 'instrument_id, side, and qty are required'}), 400
        
        if side not in ['BUY', 'SELL']:
            return jsonify({'error': 'side must be BUY or SELL'}), 400
        
        if qty <= 0:
            return jsonify({'error': 'qty must be positive'}), 400
        
        # Execute the trade
        trade = challenge_service.execute_trade(
            user_challenge_id,
            instrument_id,
            side,
            qty
        )
        
        return jsonify({
            'message': 'Trade executed successfully',
            'trade': trade.to_dict(),
            'user_challenge': user_challenge.to_dict()
        }), 200
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@challenge_bp.route('/<int:user_challenge_id>/positions', methods=['GET'])
@jwt_required()
def get_positions(user_challenge_id):
    """Get current positions for a user challenge."""
    try:
        user_id = get_jwt_identity()
        
        # Verify that the user owns this challenge
        user_challenge = UserChallenge.query.filter_by(
            id=user_challenge_id,
            user_id=user_id
        ).first()
        
        if not user_challenge:
            return jsonify({'error': 'Challenge not found or access denied'}), 404
        
        positions = challenge_service.get_current_positions(user_challenge_id)
        
        return jsonify({
            'positions': [pos.to_dict() for pos in positions],
            'total': len(positions)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@challenge_bp.route('/<int:user_challenge_id>/trades', methods=['GET'])
@jwt_required()
def get_trades(user_challenge_id):
    """Get trade history for a user challenge."""
    try:
        user_id = get_jwt_identity()
        
        # Verify that the user owns this challenge
        user_challenge = UserChallenge.query.filter_by(
            id=user_challenge_id,
            user_id=user_id
        ).first()
        
        if not user_challenge:
            return jsonify({'error': 'Challenge not found or access denied'}), 404
        
        trades = challenge_service.get_trade_history(user_challenge_id)
        
        return jsonify({
            'trades': [trade.to_dict() for trade in trades],
            'total': len(trades)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@challenge_bp.route('/<int:user_challenge_id>/equity', methods=['GET'])
@jwt_required()
def get_equity_history(user_challenge_id):
    """Get equity history for a user challenge."""
    try:
        user_id = get_jwt_identity()
        
        # Verify that the user owns this challenge
        user_challenge = UserChallenge.query.filter_by(
            id=user_challenge_id,
            user_id=user_id
        ).first()
        
        if not user_challenge:
            return jsonify({'error': 'Challenge not found or access denied'}), 404
        
        range_hours = int(request.args.get('range', 24))
        
        equity_history = challenge_service.get_equity_history(user_challenge_id, range_hours)
        
        return jsonify({
            'equity_history': [snapshot.to_dict() for snapshot in equity_history],
            'total': len(equity_history),
            'range_hours': range_hours
        }), 200
    
    except ValueError as e:
        return jsonify({'error': f'Invalid range: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@challenge_bp.route('/<int:user_challenge_id>/evaluate', methods=['POST'])
@jwt_required()
def evaluate_challenge(user_challenge_id):
    """Manually evaluate a user challenge."""
    try:
        user_id = get_jwt_identity()
        
        # Verify that the user owns this challenge
        user_challenge = UserChallenge.query.filter_by(
            id=user_challenge_id,
            user_id=user_id
        ).first()
        
        if not user_challenge:
            return jsonify({'error': 'Challenge not found or access denied'}), 404
        
        evaluation = challenge_service.evaluate_challenge(user_challenge)
        
        return jsonify({
            'evaluation': evaluation,
            'user_challenge': user_challenge.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500