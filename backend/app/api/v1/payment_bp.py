from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Payment, User, Challenge, UserChallenge
from app import db
from datetime import datetime, timedelta
import random

payment_bp = Blueprint('payment', __name__, url_prefix='/payments')


@payment_bp.route('/mock/checkout', methods=['POST'])
@jwt_required()
def mock_checkout():
    """Mock payment checkout endpoint."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        plan = data.get('plan')
        amount = data.get('amount')
        currency = data.get('currency', 'USD')
        
        if not plan or amount is None:
            return jsonify({'error': 'plan and amount are required'}), 400
        
        if plan not in ['STUDENT', 'ELITE', 'MASTER', 'BASIC', 'PREMIUM', 'PRO']:
            return jsonify({'error': 'Invalid plan. Must be STUDENT, ELITE, or MASTER'}), 400
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
        
        # Create payment record
        payment = Payment(
            user_id=user_id,
            plan=plan,
            amount=amount,
            currency=currency,
            status='PENDING',
            provider='MOCK'
        )
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'payment': payment.to_dict(),
            'message': 'Payment created successfully',
            'redirect_url': f'/payments/mock/confirm/{payment.id}'  # Mock redirect URL
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/mock/confirm/<int:payment_id>', methods=['POST'])
@jwt_required()
def mock_confirm(payment_id):
    """Mock payment confirmation endpoint."""
    try:
        user_id = get_jwt_identity()
        
        # Verify payment belongs to user
        payment = Payment.query.filter_by(id=payment_id, user_id=user_id).first()
        if not payment:
            return jsonify({'error': 'Payment not found or access denied'}), 404
        
        if payment.status != 'PENDING':
            return jsonify({'error': 'Payment already processed'}), 400
        
        # Update payment status to completed
        payment.status = 'COMPLETED'
        payment.completed_at = datetime.utcnow()
        payment.provider_transaction_id = f"MOCK_TXN_{payment.id}_{int(datetime.utcnow().timestamp())}"
        
        db.session.commit()
        
        # Create User Challenge
        # Find the challenge template based on plan or use default
        # For simplicity, we create a new challenge based on the plan
        # STARTING CAPITAL based on plan
        starting_capital = 10000.0  # Default (STUDENT)
        if payment.plan == 'ELITE':
            starting_capital = 100000.0
        elif payment.plan == 'MASTER':
            starting_capital = 250000.0
        elif payment.plan == 'PRO':  # Legacy support
            starting_capital = 50000.0
            
        # Create a new active challenge for the user
        user_challenge = UserChallenge(
            user_id=user_id,
            challenge_id=1, # Default challenge template ID
            status='IN_PROGRESS',
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(days=30),
            start_balance=starting_capital,
            current_equity=starting_capital,
            daily_start_equity=starting_capital,
            max_equity=starting_capital,
            min_equity=starting_capital,
            min_equity_all_time=starting_capital,
            min_equity_today=starting_capital
        )
        
        db.session.add(user_challenge)
        db.session.commit()
        
        return jsonify({
            'payment': payment.to_dict(),
            'message': 'Payment confirmed successfully. Challenge activated.',
            'challenge_id': user_challenge.id
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/status/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment_status(payment_id):
    """Get payment status."""
    try:
        user_id = get_jwt_identity()
        
        # Verify payment belongs to user
        payment = Payment.query.filter_by(id=payment_id, user_id=user_id).first()
        if not payment:
            return jsonify({'error': 'Payment not found or access denied'}), 404
        
        return jsonify({
            'payment': payment.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/user-payments', methods=['GET'])
@jwt_required()
def get_user_payments():
    """Get all payments for the current user."""
    try:
        user_id = get_jwt_identity()
        
        payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.created_at.desc()).all()
        
        return jsonify({
            'payments': [payment.to_dict() for payment in payments],
            'total': len(payments)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500