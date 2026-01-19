from typing import Dict, Any, Union
import re


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password: str) -> Dict[str, Union[bool, str]]:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
        
    Returns:
        Dict with 'valid' boolean and 'message' string
    """
    if len(password) < 8:
        return {'valid': False, 'message': 'Password must be at least 8 characters long'}
    
    if not re.search(r'[A-Z]', password):
        return {'valid': False, 'message': 'Password must contain at least one uppercase letter'}
    
    if not re.search(r'[a-z]', password):
        return {'valid': False, 'message': 'Password must contain at least one lowercase letter'}
    
    if not re.search(r'\d', password):
        return {'valid': False, 'message': 'Password must contain at least one digit'}
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return {'valid': False, 'message': 'Password must contain at least one special character'}
    
    return {'valid': True, 'message': 'Password is valid'}


def validate_instrument_symbol(symbol: str) -> bool:
    """Validate instrument symbol format."""
    # Allow alphanumeric characters, underscores, and hyphens, 2-15 characters
    pattern = r'^[A-Z0-9_-]{2,15}$'
    return re.match(pattern, symbol) is not None


def validate_quantity(qty: float) -> bool:
    """Validate trade quantity."""
    return qty > 0


def validate_price(price: float) -> bool:
    """Validate trade price."""
    return price > 0


def validate_challenge_params(data: Dict[str, Any]) -> Dict[str, Union[bool, str, Dict]]:
    """
    Validate challenge creation parameters.
    
    Args:
        data: Challenge parameters
        
    Returns:
        Dict with validation result
    """
    required_fields = ['name', 'start_balance', 'daily_max_loss', 'total_max_loss', 'profit_target']
    
    for field in required_fields:
        if field not in data:
            return {'valid': False, 'message': f'Missing required field: {field}'}
    
    # Validate numeric fields
    numeric_fields = ['start_balance', 'daily_max_loss', 'total_max_loss', 'profit_target']
    for field in numeric_fields:
        if not isinstance(data[field], (int, float)):
            return {'valid': False, 'message': f'{field} must be a number'}
        
        if field in ['start_balance'] and data[field] <= 0:
            return {'valid': False, 'message': f'{field} must be positive'}
        
        if field in ['daily_max_loss', 'total_max_loss', 'profit_target']:
            if data[field] < 0 or data[field] > 1:
                return {'valid': False, 'message': f'{field} must be between 0 and 1'}
    
    return {'valid': True, 'message': 'All parameters are valid'}