"""Create a challenge for ALL users who don't have one"""
import sys
sys.path.insert(0, 'c:\\Users\\HP\\Documents\\Master\\web dev\\projects\\Final project\\backend')

from datetime import datetime, timedelta
from app import create_app, db
from app.models import User, UserChallenge, Challenge

app = create_app()

with app.app_context():
    print("\n" + "="*70)
    print("CREATING CHALLENGES FOR USERS WITHOUT ONE")
    print("="*70)
    
    # Get all users
    users = User.query.all()
    
    # Get default challenge template (ID=1)
    default_challenge = Challenge.query.get(1)
    if not default_challenge:
        print("❌ No default challenge (ID=1) found!")
        exit(1)
    
    print(f"\n✅ Using challenge template: {default_challenge.name}")
    print(f"   Starting Capital: ${default_challenge.start_balance}")
    
    created_count = 0
    
    for user in users:
        # Check if user already has an IN_PROGRESS challenge
        existing = UserChallenge.query.filter_by(
            user_id=user.id, 
            status='IN_PROGRESS'
        ).first()
        
        if existing:
            print(f"\n✓ {user.email} - Already has challenge #{existing.id}")
            continue
        
        # Create new challenge
        print(f"\n⚡ Creating challenge for: {user.email} (ID: {user.id})")
        
        new_challenge = UserChallenge(
            user_id=user.id,
            challenge_id=1,
            status='IN_PROGRESS',
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(days=30),
            start_balance=default_challenge.start_balance,
            current_equity=default_challenge.start_balance,
            daily_start_equity=default_challenge.start_balance,
            max_equity=default_challenge.start_balance,
            min_equity=default_challenge.start_balance,
            min_equity_all_time=default_challenge.start_balance,
            min_equity_today=default_challenge.start_balance
        )
        
        db.session.add(new_challenge)
        created_count += 1
        print(f"   ✅ Challenge #{new_challenge.id if new_challenge.id else 'PENDING'} created!")
    
    db.session.commit()
    
    print(f"\n{'='*70}")
    print(f"✅ Created {created_count} new challenges")
    print(f"{'='*70}\n")
