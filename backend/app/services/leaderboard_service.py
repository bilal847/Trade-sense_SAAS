from typing import Dict, List, Optional
from datetime import datetime
from app.models import UserChallenge, User
from app import db
from sqlalchemy import func
from datetime import datetime
import calendar


class LeaderboardService:
    """
    Service class to manage leaderboard functionality.
    Provides monthly and all-time leaderboards based on challenge performance.
    """
    
    def get_monthly_leaderboard(self, year: Optional[int] = None, month: Optional[int] = None) -> List[Dict]:
        """
        Get monthly leaderboard for a specific month.
        
        Args:
            year: Year for the leaderboard (default: current year)
            month: Month for the leaderboard (default: current month)
            
        Returns:
            List of top 10 users for the month
        """
        if year is None or month is None:
            now = datetime.utcnow()
            year = now.year
            month = now.month
        
        # Calculate start and end dates for the month in Casablanca timezone
        from app.utils import get_casablanca_time
        casablanca_time = get_casablanca_time()
        
        # If the requested month is the current month, use current time, otherwise use month end
        if year == casablanca_time.year and month == casablanca_time.month:
            # For current month, get challenges that are completed or have latest equity snapshot
            start_date = casablanca_time.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = casablanca_time
        else:
            # For past months, get last day of the month
            last_day = calendar.monthrange(year, month)[1]
            start_date = datetime(year, month, 1)
            end_date = datetime(year, month, last_day, 23, 59, 59)
        
        # Query for challenges that were active during the month and have passed/completed
        from sqlalchemy import and_, or_
        
        # Get top 10 users based on percentage return for the month
        leaderboard_query = db.session.query(
            UserChallenge,
            User,
            func.max(UserChallenge.current_equity).label('final_equity')
        ).join(
            User, UserChallenge.user_id == User.id
        ).filter(
            and_(
                UserChallenge.status.in_(['PASSED', 'STOPPED', 'FAILED']),  # Completed challenges
                UserChallenge.start_time <= end_date,
                or_(
                    UserChallenge.end_time.is_(None),  # No end time (still in progress)
                    UserChallenge.end_time >= start_date  # Ended after start of month
                )
            )
        ).group_by(
            UserChallenge.user_id
        ).order_by(
            (func.max(UserChallenge.current_equity) - UserChallenge.start_balance) / UserChallenge.start_balance.desc()
        ).limit(10)
        
        results = leaderboard_query.all()
        
        leaderboard = []
        for user_challenge, user, final_equity in results:
            profit_pct = (final_equity - user_challenge.start_balance) / user_challenge.start_balance
            leaderboard.append({
                'rank': len(leaderboard) + 1,
                'user_id': user.id,
                'username': user.email.split('@')[0],  # Use email prefix as username
                'start_balance': user_challenge.start_balance,
                'final_equity': float(final_equity),
                'profit_pct': float(profit_pct),
                'challenge_status': user_challenge.status,
                'challenge_duration': self._calculate_duration(user_challenge.start_time, user_challenge.end_time)
            })
        
        return leaderboard
    
    def get_all_time_leaderboard(self) -> List[Dict]:
        """
        Get all-time leaderboard based on best performance.
        
        Returns:
            List of top users of all time
        """
        # Get top 10 users based on best percentage return across all challenges
        leaderboard_query = db.session.query(
            UserChallenge,
            User,
            func.max(UserChallenge.current_equity).label('max_equity')
        ).join(
            User, UserChallenge.user_id == User.id
        ).filter(
            UserChallenge.status == 'PASSED'  # Only passed challenges count
        ).group_by(
            UserChallenge.user_id
        ).order_by(
            (func.max(UserChallenge.current_equity) - UserChallenge.start_balance) / UserChallenge.start_balance.desc()
        ).limit(10)
        
        results = leaderboard_query.all()
        
        leaderboard = []
        for user_challenge, user, max_equity in results:
            profit_pct = (max_equity - user_challenge.start_balance) / user_challenge.start_balance
            leaderboard.append({
                'rank': len(leaderboard) + 1,
                'user_id': user.id,
                'username': user.email.split('@')[0],  # Use email prefix as username
                'start_balance': user_challenge.start_balance,
                'max_equity': float(max_equity),
                'profit_pct': float(profit_pct),
                'challenge_status': user_challenge.status,
                'challenge_duration': self._calculate_duration(user_challenge.start_time, user_challenge.end_time)
            })
        
        return leaderboard
    
    def _calculate_duration(self, start_time: datetime, end_time: datetime) -> str:
        """Calculate duration string from start to end time."""
        if not end_time:
            return "In Progress"
        
        duration = end_time - start_time
        days = duration.days
        hours, remainder = divmod(duration.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        
        if days > 0:
            return f"{days}d {hours}h"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"
    
    def get_user_ranking(self, user_id: int, year: Optional[int] = None, month: Optional[int] = None) -> Dict:
        """
        Get a specific user's ranking.
        
        Args:
            user_id: ID of the user
            year: Year for the ranking (default: current year)
            month: Month for the ranking (default: current month)
            
        Returns:
            Dict with user's ranking information
        """
        if year is None or month is None:
            now = datetime.utcnow()
            year = now.year
            month = now.month
        
        # Get monthly ranking
        monthly_leaderboard = self.get_monthly_leaderboard(year, month)
        monthly_rank = None
        for idx, entry in enumerate(monthly_leaderboard):
            if entry['user_id'] == user_id:
                monthly_rank = idx + 1
                break
        
        # Get all-time ranking
        all_time_leaderboard = self.get_all_time_leaderboard()
        all_time_rank = None
        for idx, entry in enumerate(all_time_leaderboard):
            if entry['user_id'] == user_id:
                all_time_rank = idx + 1
                break
        
        return {
            'user_id': user_id,
            'monthly_rank': monthly_rank,
            'all_time_rank': all_time_rank,
            'monthly_performance': next((item for item in monthly_leaderboard if item['user_id'] == user_id), None),
            'all_time_performance': next((item for item in all_time_leaderboard if item['user_id'] == user_id), None)
        }