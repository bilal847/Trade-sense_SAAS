import sqlite3
import bcrypt
from datetime import datetime
import os

# Try to find the DB
db_paths = [
    "instance/tradesense.db",
    "tradesense.db",
    "../instance/tradesense.db"
]

db_path = None
for p in db_paths:
    if os.path.exists(p):
        db_path = p
        break

if not db_path:
    # If not found, create in instance
    if not os.path.exists('instance'):
        os.makedirs('instance')
    db_path = "instance/tradesense.db"
    print(f"DB not found, creating new at {db_path} (Warning: might not match app DB)")

print(f"Using DB: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

email = "bilaldebbar002@gmail.com"
password = "Devilmayc.//24"

# Generate hash
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

try:
    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if not cursor.fetchone():
        print("Error: 'users' table does not exist. Run migrations first.")
    else:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()
        
        now = datetime.utcnow()
        
        if existing:
            print(f"Updating user {email}...")
            cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", (hashed, email))
        else:
            print(f"Creating user {email}...")
            # We must be careful with columns. 
            # Based on model: email, password_hash, first_name, last_name, is_active, is_verified, role, last_login, suspension_type, suspension_end, created_at, updated_at
            # We'll insert minimal required fields
            cursor.execute("""
                INSERT INTO users (created_at, updated_at, email, password_hash, is_active, is_verified, role)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (now, now, email, hashed, 1, 1, 'user'))
            
        conn.commit()
        print("User credentials updated successfully.")

except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
