from datetime import datetime, timedelta
import pytz
from typing import Dict, Any, Optional


def get_casablanca_time() -> datetime:
    """Get current time in Casablanca timezone."""
    tz = pytz.timezone('Africa/Casablanca')
    return datetime.now(tz)


def get_start_of_day_casablanca(dt: Optional[datetime] = None) -> datetime:
    """Get the start of the day in Casablanca timezone."""
    if dt is None:
        dt = get_casablanca_time()
    else:
        # Convert to Casablanca timezone if needed
        if dt.tzinfo is None:
            tz = pytz.timezone('Africa/Casablanca')
            dt = tz.localize(dt)
        else:
            dt = dt.astimezone(pytz.timezone('Africa/Casablanca'))
    
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def calculate_equity(balance: float, unrealized_pnl: float) -> float:
    """Calculate total equity."""
    return balance + unrealized_pnl


def calculate_daily_drawdown(daily_start_equity: float, current_equity: float) -> float:
    """Calculate daily drawdown."""
    if daily_start_equity == 0:
        return 0.0
    return (daily_start_equity - current_equity) / daily_start_equity


def calculate_total_drawdown(initial_balance: float, current_equity: float) -> float:
    """Calculate total drawdown from initial balance."""
    if initial_balance == 0:
        return 0.0
    return (initial_balance - current_equity) / initial_balance


def calculate_profit_percentage(initial_balance: float, current_equity: float) -> float:
    """Calculate profit percentage."""
    if initial_balance == 0:
        return 0.0
    return (current_equity - initial_balance) / initial_balance


def format_currency(amount: float, currency: str = 'USD') -> str:
    """Format currency amount with proper symbol."""
    if currency == 'USD':
        return f"${amount:,.2f}"
    elif currency == 'EUR':
        return f"€{amount:,.2f}"
    elif currency == 'MAD':
        return f"MAD {amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"


def safe_get(data: Dict[str, Any], key: str, default: Any = None) -> Any:
    """Safely get value from dictionary with default fallback."""
    try:
        return data.get(key, default)
    except AttributeError:
        return default


def round_to_tick(price: float, tick_size: float) -> float:
    """Round price to nearest tick size."""
    return round(price / tick_size) * tick_size