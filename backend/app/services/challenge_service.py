from typing import Dict, List, Optional
from datetime import datetime
from app.models import UserChallenge, Challenge, Position, Trade, EquitySnapshot, Instrument
from app.services.risk_service import RiskService
from app.services.market_data_service import MarketDataService
from app import db
from app.utils import calculate_equity, get_casablanca_time, get_start_of_day_casablanca
import logging

logger = logging.getLogger(__name__)


class ChallengeService:
    """
    Service class to manage challenge-related operations.
    Handles starting challenges, processing trades, and managing challenge state.
    """
    
    def __init__(self):
        self.risk_service = RiskService()
        self.market_data_service = MarketDataService()
    
    def start_challenge(self, user_id: int, challenge_id: int) -> UserChallenge:
        """
        Start a new challenge for a user.

        Args:
            user_id: ID of the user
            challenge_id: ID of the challenge to start

        Returns:
            UserChallenge instance
        """
        # Get the challenge
        challenge = Challenge.query.get(challenge_id)
        if not challenge or not challenge.is_active:
            raise ValueError("Challenge not found or inactive")
        
        # Create a new user challenge
        user_challenge = UserChallenge(
            user_id=user_id,
            challenge_id=challenge_id,
            status='IN_PROGRESS',
            start_balance=challenge.start_balance,
            start_time=datetime.utcnow(),
            daily_start_equity=challenge.start_balance,
            current_equity=challenge.start_balance,
            max_equity=challenge.start_balance,
            min_equity=challenge.start_balance,
            min_equity_all_time=challenge.start_balance,
            min_equity_today=challenge.start_balance,
            last_eval_at=datetime.utcnow()
        )
        
        db.session.add(user_challenge)
        db.session.commit()
        
        # Create initial equity snapshot
        initial_snapshot = EquitySnapshot(
            user_challenge_id=user_challenge.id,
            equity=challenge.start_balance,
            balance=challenge.start_balance,
            unrealized_pnl=0.0,
            ts=datetime.utcnow()
        )
        db.session.add(initial_snapshot)
        db.session.commit()
        
        return user_challenge
    
    def execute_trade(self, user_challenge_id: int, instrument_id: int, side: str, qty: float) -> Trade:
        """
        Execute a market order for a user challenge.

        Args:
            user_challenge_id: ID of the user challenge
            instrument_id: ID of the instrument to trade
            side: 'BUY' or 'SELL'
            qty: Quantity to trade

        Returns:
            Trade instance
        """
        # Validate inputs
        if side not in ['BUY', 'SELL']:
            raise ValueError("Side must be 'BUY' or 'SELL'")
        
        if qty <= 0:
            raise ValueError("Quantity must be positive")
        
        # Get user challenge and instrument
        user_challenge = UserChallenge.query.get(user_challenge_id)
        if not user_challenge:
            raise ValueError("User challenge not found")
        
        instrument = Instrument.query.get(instrument_id)
        if not instrument:
            raise ValueError("Instrument not found")
        
        # Get current market price
        quote = self.market_data_service.get_quote(
            instrument.provider_symbol,
            instrument.provider
        )
        
        # Determine price based on side (bid for sell, ask for buy)
        if side == 'BUY':
            price = quote['ask'] if quote.get('ask') else quote['last']
        else:  # SELL
            price = quote['bid'] if quote.get('bid') else quote['last']
        
        # Calculate trade value
        trade_value = qty * price
        
        # Create the trade
        trade = Trade(
            user_challenge_id=user_challenge_id,
            instrument_id=instrument_id,
            side=side,
            qty=qty,
            price=price,
            fee=0.0,  # For demo, no fees
            realized_pnl=0.0  # Will be calculated based on position close
        )
        
        db.session.add(trade)
        
        # Update position
        existing_position = Position.query.filter_by(
            user_challenge_id=user_challenge_id,
            instrument_id=instrument_id
        ).first()
        
        if existing_position:
            # If same side, increase position
            if (side == 'BUY' and existing_position.side == 'LONG') or \
               (side == 'SELL' and existing_position.side == 'SHORT'):
                # Increase position
                total_qty = existing_position.qty + qty
                total_value = (existing_position.qty * existing_position.avg_price) + trade_value
                existing_position.avg_price = total_value / total_qty
                existing_position.qty = total_qty
            else:
                # Opposite side - could be closing position or reversing
                if qty > existing_position.qty:
                    # Close existing position and open new one
                    closed_qty = existing_position.qty
                    # Calculate realized PnL
                    if (side == 'SELL' and existing_position.side == 'LONG') or \
                       (side == 'BUY' and existing_position.side == 'SHORT'):
                        pnl = (price - existing_position.avg_price) * closed_qty
                        if existing_position.side == 'SHORT':
                            pnl = -pnl
                        trade.realized_pnl = pnl
                    else:
                        trade.realized_pnl = 0  # This shouldn't happen with proper validation
                    
                    # Update position to new direction
                    remaining_qty = qty - closed_qty
                    existing_position.side = 'LONG' if side == 'BUY' else 'SHORT'
                    existing_position.qty = remaining_qty
                    existing_position.avg_price = price
                elif qty == existing_position.qty:
                    # Close position exactly
                    if (side == 'SELL' and existing_position.side == 'LONG') or \
                       (side == 'BUY' and existing_position.side == 'SHORT'):
                        pnl = (price - existing_position.avg_price) * qty
                        if existing_position.side == 'SHORT':
                            pnl = -pnl
                        trade.realized_pnl = pnl
                    else:
                        trade.realized_pnl = 0  # This shouldn't happen with proper validation
                    
                    # Remove the position since it's fully closed
                    db.session.delete(existing_position)
                else:
                    # Partial close of existing position
                    if (side == 'SELL' and existing_position.side == 'LONG') or \
                       (side == 'BUY' and existing_position.side == 'SHORT'):
                        pnl = (price - existing_position.avg_price) * qty
                        if existing_position.side == 'SHORT':
                            pnl = -pnl
                        trade.realized_pnl = pnl
                    
                    existing_position.qty -= qty
        else:
            # Create new position
            position = Position(
                user_challenge_id=user_challenge_id,
                instrument_id=instrument_id,
                side='LONG' if side == 'BUY' else 'SHORT',
                qty=qty,
                avg_price=price,
                opened_at=datetime.utcnow()
            )
            db.session.add(position)
        
        # Update user challenge equity based on trade
        # This is a simplified approach - in a real system you'd recalculate from positions
        if side == 'BUY':
            # Buying decreases cash but creates position
            pass  # Equity will be updated via position marking
        else:
            # Selling increases cash
            pass  # Equity will be updated via position marking
        
        db.session.commit()
        
        # Evaluate risk after trade
        self.evaluate_challenge(user_challenge)
        
        return trade
    
    def get_current_positions(self, user_challenge_id: int) -> List[Position]:
        """
        Get all current positions for a user challenge.

        Args:
            user_challenge_id: ID of the user challenge

        Returns:
            List of Position instances
        """
        return Position.query.filter_by(user_challenge_id=user_challenge_id).all()
    
    def get_trade_history(self, user_challenge_id: int) -> List[Trade]:
        """
        Get trade history for a user challenge.

        Args:
            user_challenge_id: ID of the user challenge

        Returns:
            List of Trade instances
        """
        return Trade.query.filter_by(user_challenge_id=user_challenge_id).order_by(Trade.created_at.desc()).all()
    
    def get_equity_history(self, user_challenge_id: int, range_hours: int = 24) -> List[EquitySnapshot]:
        """
        Get equity history for a user challenge.

        Args:
            user_challenge_id: ID of the user challenge
            range_hours: Number of hours to get history for

        Returns:
            List of EquitySnapshot instances
        """
        from datetime import timedelta
        start_time = datetime.utcnow() - timedelta(hours=range_hours)
        return EquitySnapshot.query.filter(
            EquitySnapshot.user_challenge_id == user_challenge_id,
            EquitySnapshot.ts >= start_time
        ).order_by(EquitySnapshot.ts.asc()).all()
    
    def evaluate_challenge(self, user_challenge: UserChallenge) -> Dict:
        """
        Evaluate the current status of a user challenge based on risk rules.

        Args:
            user_challenge: UserChallenge instance to evaluate

        Returns:
            Dict with evaluation results
        """
        # Get current positions to calculate unrealized PnL
        positions = self.get_current_positions(user_challenge.id)
        
        # Calculate unrealized PnL for all positions
        unrealized_pnl = 0.0
        for position in positions:
            # Get current market price for the instrument
            instrument = Instrument.query.get(position.instrument_id)
            if instrument:
                quote = self.market_data_service.get_quote(
                    instrument.provider_symbol,
                    instrument.provider
                )
                
                current_price = quote['last']  # Use last price for marking
                price_diff = current_price - position.avg_price
                
                if position.side == 'LONG':
                    unrealized_pnl += price_diff * position.qty
                else:  # SHORT
                    unrealized_pnl -= price_diff * position.qty
        
        # Calculate current equity
        current_equity = user_challenge.start_balance + unrealized_pnl
        
        # Update current equity
        user_challenge.current_equity = current_equity
        
        # Update min equity if needed
        if current_equity < user_challenge.min_equity_all_time:
            user_challenge.min_equity_all_time = current_equity
        
        # Check if we're at the start of a new day (Casablanca time)
        current_time_casablanca = get_casablanca_time()
        start_of_day_casablanca = get_start_of_day_casablanca()
        
        # If we're in a new day, update daily start equity
        if user_challenge.start_time.replace(tzinfo=None) < start_of_day_casablanca.replace(tzinfo=None):
            # Check if we're now in a new day
            if user_challenge.start_time.replace(tzinfo=None) < current_time_casablanca.replace(tzinfo=None):
                if current_time_casablanca.date() > user_challenge.start_time.replace(tzinfo=None).date():
                    # New day has started
                    user_challenge.daily_start_equity = current_equity
                    user_challenge.min_equity_today = current_equity
        
        # Update min equity for today if needed
        if current_equity < user_challenge.min_equity_today:
            user_challenge.min_equity_today = current_equity
        
        # Update max equity if needed
        if current_equity > user_challenge.max_equity:
            user_challenge.max_equity = current_equity
        
        # Evaluate using risk service
        evaluation = self.risk_service.evaluate_challenge_status(
            user_challenge,
            current_equity,
            user_challenge.daily_start_equity,
            user_challenge.min_equity_today,
            user_challenge.min_equity_all_time,
            user_challenge.max_equity
        )
        
        # Update challenge status
        user_challenge.status = evaluation['status']
        user_challenge.last_eval_at = datetime.utcnow()
        
        # Save changes
        db.session.commit()
        
        # Create equity snapshot
        snapshot = EquitySnapshot(
            user_challenge_id=user_challenge.id,
            equity=current_equity,
            balance=user_challenge.start_balance + evaluation.get('realized_pnl', 0),
            unrealized_pnl=unrealized_pnl,
            ts=datetime.utcnow()
        )
        db.session.add(snapshot)
        db.session.commit()
        
        return evaluation