import pytest
from unittest.mock import Mock, MagicMock
from app.services.risk_service import RiskService
from app.models import UserChallenge, Challenge


def test_evaluate_challenge_status_pass():
    """Test that challenge evaluation correctly identifies a passed challenge."""
    # Create mock user challenge
    mock_challenge = Mock()
    mock_challenge.daily_max_loss = 0.05  # 5%
    mock_challenge.total_max_loss = 0.10  # 10%
    mock_challenge.profit_target = 0.10   # 10%
    
    mock_user_challenge = Mock()
    mock_user_challenge.challenge = mock_challenge
    mock_user_challenge.start_balance = 10000.0
    
    # Test case: current equity exceeds profit target
    result = RiskService.evaluate_challenge_status(
        mock_user_challenge,
        current_equity=11000.0,  # 10% profit achieved
        daily_start_equity=10000.0,
        min_equity_today=9500.0,  # 5% daily drawdown (acceptable)
        min_equity_all_time=9000.0,  # 10% total drawdown (at limit)
        max_equity_all_time=11500.0
    )
    
    assert result['status'] == 'PASSED'
    assert len(result['reasons']) == 1
    assert result['reasons'][0]['rule'] == 'profit_target'


def test_evaluate_challenge_status_fail_daily_loss():
    """Test that challenge evaluation correctly identifies failure due to daily loss."""
    # Create mock user challenge
    mock_challenge = Mock()
    mock_challenge.daily_max_loss = 0.05  # 5%
    mock_challenge.total_max_loss = 0.10  # 10%
    mock_challenge.profit_target = 0.10   # 10%
    
    mock_user_challenge = Mock()
    mock_user_challenge.challenge = mock_challenge
    mock_user_challenge.start_balance = 10000.0
    
    # Test case: daily drawdown exceeds limit
    result = RiskService.evaluate_challenge_status(
        mock_user_challenge,
        current_equity=9400.0,  # Still in profit, but daily drawdown exceeded
        daily_start_equity=10000.0,
        min_equity_today=9400.0,  # 6% daily drawdown (exceeds 5% limit)
        min_equity_all_time=9000.0,  # 10% total drawdown (at limit)
        max_equity_all_time=10500.0
    )
    
    assert result['status'] == 'FAILED'
    assert len(result['reasons']) == 1
    assert result['reasons'][0]['rule'] == 'daily_max_loss'


def test_evaluate_challenge_status_fail_total_loss():
    """Test that challenge evaluation correctly identifies failure due to total loss."""
    # Create mock user challenge
    mock_challenge = Mock()
    mock_challenge.daily_max_loss = 0.05  # 5%
    mock_challenge.total_max_loss = 0.10  # 10%
    mock_challenge.profit_target = 0.10   # 10%
    
    mock_user_challenge = Mock()
    mock_user_challenge.challenge = mock_challenge
    mock_user_challenge.start_balance = 10000.0
    
    # Test case: total drawdown exceeds limit
    result = RiskService.evaluate_challenge_status(
        mock_user_challenge,
        current_equity=9200.0,  # 8% loss
        daily_start_equity=10000.0,
        min_equity_today=9600.0,  # 4% daily drawdown (acceptable)
        min_equity_all_time=8900.0,  # 11% total drawdown (exceeds 10% limit)
        max_equity_all_time=10200.0
    )
    
    assert result['status'] == 'FAILED'
    assert len(result['reasons']) == 1
    assert result['reasons'][0]['rule'] == 'total_max_loss'


def test_evaluate_challenge_status_in_progress():
    """Test that challenge evaluation correctly identifies ongoing challenges."""
    # Create mock user challenge
    mock_challenge = Mock()
    mock_challenge.daily_max_loss = 0.05  # 5%
    mock_challenge.total_max_loss = 0.10  # 10%
    mock_challenge.profit_target = 0.10   # 10%
    
    mock_user_challenge = Mock()
    mock_user_challenge.challenge = mock_challenge
    mock_user_challenge.start_balance = 10000.0
    
    # Test case: all metrics within limits
    result = RiskService.evaluate_challenge_status(
        mock_user_challenge,
        current_equity=10200.0,  # 2% profit
        daily_start_equity=10000.0,
        min_equity_today=9600.0,  # 4% daily drawdown (acceptable)
        min_equity_all_time=9200.0,  # 8% total drawdown (acceptable)
        max_equity_all_time=10300.0
    )
    
    assert result['status'] == 'IN_PROGRESS'
    assert len(result['reasons']) == 0


def test_calculate_position_sizing():
    """Test position sizing calculation."""
    result = RiskService.calculate_position_sizing(
        account_equity=10000.0,
        risk_percentage=0.02,  # 2% risk
        stop_loss_pips=100,
        instrument_tick_size=0.0001
    )
    
    # Should calculate position size based on risk
    assert 'position_size' in result
    assert 'max_risk_amount' in result
    assert result['max_risk_amount'] == 200.0  # 2% of 10000


def test_calculate_position_sizing_error():
    """Test position sizing calculation with invalid inputs."""
    result = RiskService.calculate_position_sizing(
        account_equity=10000.0,
        risk_percentage=0.02,
        stop_loss_pips=0,  # Invalid - no stop loss
        instrument_tick_size=0.0001
    )
    
    assert 'error' in result