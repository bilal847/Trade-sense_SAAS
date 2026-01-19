from flask import Blueprint, request, jsonify
from app.services import LeaderboardService

leaderboard_bp = Blueprint('leaderboard', __name__, url_prefix='/leaderboard')
leaderboard_service = LeaderboardService()


@leaderboard_bp.route('/monthly', methods=['GET'])
def get_monthly_leaderboard():
    """Get monthly leaderboard."""
    try:
        year_str = request.args.get('year')
        month_str = request.args.get('month')
        
        # Convert to int if provided and not empty
        year = int(year_str) if year_str and year_str.strip() else None
        month = int(month_str) if month_str and month_str.strip() else None
        
        leaderboard = leaderboard_service.get_monthly_leaderboard(year, month)
        
        return jsonify({
            'leaderboard': leaderboard,
            'month': month,
            'year': year
        }), 200
    
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@leaderboard_bp.route('/all-time', methods=['GET'])
def get_all_time_leaderboard():
    """Get all-time leaderboard."""
    try:
        leaderboard = leaderboard_service.get_all_time_leaderboard()
        
        return jsonify({
            'leaderboard': leaderboard
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@leaderboard_bp.route('/user-ranking', methods=['GET'])
def get_user_ranking():
    """Get a specific user's ranking."""
    try:
        user_id_str = request.args.get('user_id')
        year_str = request.args.get('year')
        month_str = request.args.get('month')
        
        if not user_id_str:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Convert to int
        user_id = int(user_id_str)
        year = int(year_str) if year_str and year_str.strip() else None
        month = int(month_str) if month_str and month_str.strip() else None
        
        ranking = leaderboard_service.get_user_ranking(user_id, year, month)
        
        return jsonify(ranking), 200
    
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500