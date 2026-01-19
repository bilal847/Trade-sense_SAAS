from typing import Dict, Optional
from app.models import User
from app import db, bcrypt
from app.utils import validate_email, validate_password
from flask_jwt_extended import create_access_token, create_refresh_token


class AuthService:
    """
    Service class to handle authentication operations.
    """
    
    @staticmethod
    def register_user(email: str, password: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> Dict:
        """
        Register a new user.
        
        Args:
            email: User's email address
            password: User's password
            first_name: User's first name (optional)
            last_name: User's last name (optional)
            
        Returns:
            Dict with user info and tokens
        """
        # Validate inputs
        if not validate_email(email):
            raise ValueError("Invalid email format")
        
        validation_result = validate_password(password)
        if not validation_result['valid']:
            raise ValueError(validation_result['message'])
        
        # Check if user already exists
        existing_user = User.find_by_email(email)
        if existing_user:
            raise ValueError("Email already registered")
        
        # Create new user
        user = User(
            email=email.lower(),
            first_name=first_name,
            last_name=last_name,
            is_active=True
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            'user': user.to_dict(include_sensitive=False),
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def login_user(email: str, password: str) -> Dict:
        """
        Authenticate user and return tokens.
        
        Args:
            email: User's email address
            password: User's password
            
        Returns:
            Dict with user info and tokens
        """
        user = User.find_by_email(email.lower())
        if not user or not user.check_password(password):
            raise ValueError("Invalid email or password")
        
        if not user.is_active:
            raise ValueError("Account is deactivated")
        
        # Update last login
        from datetime import datetime
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            'user': user.to_dict(include_sensitive=False),
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            user_id: User's ID
            
        Returns:
            User object or None
        """
        return User.query.get(user_id)
    
    @staticmethod
    def update_user_profile(user_id: int, **kwargs) -> Dict:
        """
        Update user profile information.
        
        Args:
            user_id: User's ID
            **kwargs: Fields to update (first_name, last_name, etc.)
            
        Returns:
            Updated user info
        """
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Update allowed fields
        allowed_fields = {'first_name', 'last_name'}
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(user, field, value)
        
        db.session.commit()
        
        return user.to_dict(include_sensitive=False)
    
    @staticmethod
    def change_password(user_id: int, current_password: str, new_password: str) -> bool:
        """
        Change user's password.
        
        Args:
            user_id: User's ID
            current_password: Current password
            new_password: New password
            
        Returns:
            True if successful
        """
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        
        if not user.check_password(current_password):
            raise ValueError("Current password is incorrect")
        
        validation_result = validate_password(new_password)
        if not validation_result['valid']:
            raise ValueError(validation_result['message'])
        
        user.set_password(new_password)
        db.session.commit()
        
        return True