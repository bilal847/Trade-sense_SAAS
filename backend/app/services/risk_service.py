from typing import Dict, List, Optional, Tuple
from datetime import datetime
from app.utils import calculate_daily_drawdown, calculate_total_drawdown, calculate_profit_percentage, get_start_of_day_casablanca
from app.models import UserChallenge
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class RiskService:
    """
    Service class to handle risk calculations and challenge evaluation.
    Implements prop-firm style risk management rules.
    """
    
    @staticmethod
    def evaluate_challenge_status(
        user_challenge: UserChallenge,
        current_equity: float,
        daily_start_equity: float,
        min_equity_today: float,
        min_equity_all_time: float,
        max_equity_all_time: float
    ) -> Dict:
        """
        Evaluate the current status of a user challenge based on risk rules.
        
        Args:
            user_challenge: UserChallenge model instance
            current_equity: Current equity value
            daily_start_equity: Equity at start of current day
            min_equity_today: Minimum equity reached today
            min_equity_all_time: Minimum equity reached during challenge
            max_equity_all_time: Maximum equity reached during challenge
            
        Returns:
            Dict with status, reasons, and metrics
        """
        challenge = user_challenge.challenge
        
        # Calculate metrics
        daily_drawdown = calculate_daily_drawdown(daily_start_equity, min_equity_today)
        total_drawdown = calculate_total_drawdown(user_challenge.start_balance, min_equity_all_time)
        profit_pct = calculate_profit_percentage(user_challenge.start_balance, current_equity)
        
        # Initialize result
        result = {
            'status': user_challenge.status if user_challenge.status == 'FAILED' else 'IN_PROGRESS',
            'reasons': [],
            'metrics': {
                'daily_drawdown': daily_drawdown,
                'total_drawdown': total_drawdown,
                'profit_pct': profit_pct,
                'current_equity': current_equity,
                'initial_balance': user_challenge.start_balance,
                'daily_start_equity': daily_start_equity
            }
        }
        
        # Check daily max loss rule
        if daily_drawdown >= challenge.daily_max_loss:
            result['status'] = 'FAILED'
            result['reasons'].append({
                'rule': 'daily_max_loss',
                'threshold': challenge.daily_max_loss,
                'observed': daily_drawdown,
                'message': f'Daily drawdown {daily_drawdown:.2%} exceeds maximum allowed {challenge.daily_max_loss:.2%}'
            })
        
        # Check total max loss rule (only if not already failed for daily loss)
        if result['status'] != 'FAILED' and total_drawdown >= challenge.total_max_loss:
            result['status'] = 'FAILED'
            result['reasons'].append({
                'rule': 'total_max_loss',
                'threshold': challenge.total_max_loss,
                'observed': total_drawdown,
                'message': f'Total drawdown {total_drawdown:.2%} exceeds maximum allowed {challenge.total_max_loss:.2%}'
            })
        
        # Check profit target (only if not already failed)
        if result['status'] != 'FAILED' and current_equity >= user_challenge.start_balance * (1 + challenge.profit_target):
            result['status'] = 'PASSED'
            result['reasons'].append({
                'rule': 'profit_target',
                'threshold': challenge.profit_target,
                'observed': profit_pct,
                'message': f'Profit target achieved: {profit_pct:.2%} >= {challenge.profit_target:.2%}'
            })
        
        # Add additional metrics
        result['metrics']['max_equity'] = max_equity_all_time
        result['metrics']['sharpe_like'] = RiskService._calculate_sharpe_like(
            user_challenge.start_balance, 
            max_equity_all_time, 
            total_drawdown if total_drawdown > 0 else 1e-6  # Avoid division by zero
        )
        
        return result
    
    @staticmethod
    def _calculate_sharpe_like(initial_balance: float, max_equity: float, max_drawdown: float) -> float:
        """
        Calculate a simplified Sharpe-like ratio.
        This is a simplified version for demonstration purposes.
        """
        if max_drawdown == 0:
            return float('inf') if max_equity > initial_balance else 0
        
        return (max_equity - initial_balance) / initial_balance / max_drawdown if max_drawdown > 0 else 0
    
    @staticmethod
    def calculate_equity_metrics(
        balance: float,
        positions: List,
        market_data_service
    ) -> Tuple[float, float, float]:
        """
        Calculate equity metrics based on balance and open positions.
        
        Args:
            balance: Current account balance
            positions: List of open positions
            market_data_service: Market data service instance
            
        Returns:
            Tuple of (total_equity, unrealized_pnl, realized_pnl)
        """
        unrealized_pnl = 0.0
        realized_pnl = 0.0  # For this implementation, we'll assume no realized PnL in positions
        
        for position in positions:
            try:
                # Get current market price
                quote = market_data_service.get_quote(
                    position.instrument.provider_symbol,
                    position.instrument.provider
                )
                
                current_price = quote['last']
                avg_price = position.avg_price
                qty = position.qty
                
                # Calculate PnL based on position side
                if position.side.upper() == 'LONG':
                    position_pnl = (current_price - avg_price) * qty
                elif position.side.upper() == 'SHORT':
                    position_pnl = (avg_price - current_price) * qty
                else:
                    position_pnl = 0.0
                
                unrealized_pnl += position_pnl
            except Exception as e:
                logger.error(f"Error calculating PnL for position {position.id}: {str(e)}")
                continue
        
        total_equity = balance + unrealized_pnl
        return total_equity, unrealized_pnl, realized_pnl
    
    @staticmethod
    def should_update_daily_start_equity(
        user_challenge: UserChallenge,
        current_time: Optional[datetime] = None
    ) -> bool:
        """
        Determine if we should update the daily start equity.
        This happens when we cross into a new day in the Casablanca timezone.
        
        Args:
            user_challenge: UserChallenge model instance
            current_time: Current time (optional, will use now if not provided)
            
        Returns:
            True if daily start equity should be updated, False otherwise
        """
        if current_time is None:
            from app.utils import get_casablanca_time
            current_time = get_casablanca_time()
        
        # Get start of current day in Casablanca timezone
        start_of_current_day = get_start_of_day_casablanca(current_time)
        
        # Get start of day when challenge started
        start_of_challenge_day = get_start_of_day_casablanca(user_challenge.start_time)
        
        # If current day is different from the day we last updated daily_start_equity,
        # or if it's the same day as challenge start but we haven't set it yet
        if not user_challenge.daily_start_equity:
            # First time setting it - should be the equity at challenge start
            return True
        
        # Check if we've moved to a new day
        last_equity_update_day = get_start_of_day_casablanca(user_challenge.updated_at)
        
        return start_of_current_day > last_equity_update_day
    
    @staticmethod
    def calculate_position_sizing(
        account_equity: float,
        risk_percentage: float,
        stop_loss_pips: float,
        instrument_tick_size: float
    ) -> Dict:
        """
        Calculate position size based on risk parameters.
        
        Args:
            account_equity: Current account equity
            risk_percentage: Percentage of equity to risk (e.g., 0.02 for 2%)
            stop_loss_pips: Stop loss in pips
            instrument_tick_size: Tick size of the instrument
            
        Returns:
            Dict with position size and risk calculations
        """
        if stop_loss_pips <= 0 or instrument_tick_size <= 0:
            return {'error': 'Stop loss and tick size must be positive'}
        
        # Calculate maximum risk amount
        max_risk_amount = account_equity * risk_percentage
        
        # Calculate position size based on stop loss
        # This is a simplified calculation - in reality would depend on instrument
        position_size = max_risk_amount / stop_loss_pips if stop_loss_pips > 0 else 0
        
        # Round to nearest tick size
        if instrument_tick_size > 0:
            position_size = round(position_size / instrument_tick_size) * instrument_tick_size
        
        return {
            'position_size': max(position_size, 0),
            'max_risk_amount': max_risk_amount,
            'risk_percentage': risk_percentage,
            'stop_loss_pips': stop_loss_pips
        }