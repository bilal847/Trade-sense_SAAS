"""Direct database query to check all users and their challenges"""
import sys
sys.path.insert(0, 'c:\\Users\\HP\\Documents\\Master\\web dev\\projects\\Final project\\backend')

from app import create_app, db
from app.models import User, UserChallenge

app = create_app()

with app.app_context():
    print("\n" + "="*70)
    print("DATABASE CHECK: All Users and Their Challenges")
    print("="*70)
    
    users = User.query.all()
    print(f"\nTotal Users: {len(users)}")
    
    for user in users:
        print(f"\n{'─'*70}")
        print(f"👤 User: {user.email}")
        print(f"   ID: {user.id} | Role: {user.role} | Name: {user.first_name} {user.last_name}")
        
        challenges = UserChallenge.query.filter_by(user_id=user.id).all()
        print(f"   Total Challenges: {len(challenges)}")
        
        if challenges:
            for uc in challenges:
                print(f"   ├─ Challenge #{uc.id}")
                print(f"   │  Status: {uc.status}")
                print(f"   │  Equity: ${uc.current_equity}")
                print(f"   │  Created: {uc.created_at}")
        else:
            print(f"   └─ ⚠️ No challenges")
    
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    
    all_challenges = UserChallenge.query.all()
    print(f"Total Challenges in DB: {len(all_challenges)}")
    
    in_progress = UserChallenge.query.filter_by(status='IN_PROGRESS').all()
    print(f"IN_PROGRESS: {len(in_progress)}")
    
    active = UserChallenge.query.filter_by(status='ACTIVE').all()
    print(f"ACTIVE: {len(active)}")
    
    print(f"{'='*70}\n")
