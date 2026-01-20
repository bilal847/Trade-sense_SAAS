import requests
import json

BASE_URL = "http://localhost:5000/api/v1"

def get_token_for_user(email, password):
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        if response.status_code == 200:
            data = response.json()
            return data.get('access_token'), data.get('user', {})
        return None, None
    except:
        return None, None

def check_user_challenges(email, password, label):
    print(f"\n{'='*60}")
    print(f"Checking: {label} ({email})")
    print(f"{'='*60}")
    
    token, user = get_token_for_user(email, password)
    if not token:
        print(f"❌ Login failed for {email}")
        return
    
    print(f"✅ Logged in as: {user.get('email')} (ID: {user.get('id')}, Role: {user.get('role')})")
    
    # Check challenges
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/challenges/my", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        active = data.get('active_challenges', [])
        all_ch = data.get('all_challenges', [])
        
        print(f"\n📊 Challenge Summary:")
        print(f"  Active Challenges: {len(active)}")
        print(f"  All Challenges: {len(all_ch)}")
        
        if all_ch:
            print(f"\n📋 All Challenges:")
            for ch in all_ch:
                status = ch.get('status', 'UNKNOWN')
                ch_id = ch.get('id')
                equity = ch.get('current_equity', 0)
                has_nested = 'challenge' in ch
                print(f"  - ID: {ch_id} | Status: {status} | Equity: ${equity} | Has nested: {has_nested}")
        else:
            print(f"\n⚠️ No challenges found for this user")
    else:
        print(f"❌ API Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    print("Checking all user accounts...\n")
    
    # Check all known users
    check_user_challenges("admin@tradesense.com", "admin123", "Admin User")
    check_user_challenges("demo@tradesense.com", "DemoPassword123!", "Demo User")
    check_user_challenges("bilaldebbar002@gmail.com", "password", "Bilal (Custom)")
    
    print(f"\n{'='*60}")
    print("Scan complete!")
    print(f"{'='*60}")
