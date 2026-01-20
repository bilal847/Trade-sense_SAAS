from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    email = "bilaldebbar002@gmail.com"
    password = "Devilmayc.//24"
    
    user = User.query.filter_by(email=email).first()
    if user:
        print(f"User {email} found. Updating password and flags...")
        user.set_password(password)
        user.is_verified = True
        user.is_active = True
    else:
        print(f"Creating new user {email}...")
        user = User(email=email, is_verified=True, is_active=True)
        user.set_password(password)
        db.session.add(user)
    
    try:
        db.session.commit()
        print("User credentials updated successfully.")
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
