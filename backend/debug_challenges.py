import requests
import json

BASE_URL = "http://localhost:5000/api/v1"

def login(email, password):
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        if response.status_code == 200:
            return response.json()['access_token']
        else:
            print(f"Login failed for {email}: {response.text}")
            return None
    except Exception as e:
        print(f"Error logging in {email}: {e}")
        return None

def check_challenges(token, user_label):
    if not token:
        return
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/challenges/my", headers=headers)
        
        print(f"\n--- Challenges for {user_label} ---")
        if response.status_code == 200:
            data = response.json()
            active = data.get('active_challenges', [])
            all_ch = data.get('all_challenges', [])
            print(f"Active Challenges: {len(active)}")
            print(f"All Users Challenges: {len(all_ch)}")
            for c in active:
                print(f" - ID: {c.get('id')}, Status: {c.get('status')}, Equity: {c.get('current_equity')}")
        else:
            print(f"Failed to fetch challenges: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error checking challenges: {e}")

if __name__ == "__main__":
    print("DEBUG START")
    
    # Check if Challenge 1 exists (via public endpoint)
    # We can't easily check DB directly from here without app context, so we infer from purchase error.
    
    admin_token = login("admin@tradesense.com", "admin123")
    if not admin_token:
        print("LOGIN FAILED")
        exit()

    # 1. Purchase
    print("Attempts Buy...")
    try:
        res = requests.post(f"{BASE_URL}/payments/mock/checkout", 
                            json={"plan": "PRO", "amount": 99}, 
                            headers={"Authorization": f"Bearer {admin_token}"})
        if res.status_code == 201:
            pid = res.json()['payment']['id']
            print(f"Pay created: {pid}")
            
            # Confirm
            conf_res = requests.post(f"{BASE_URL}/payments/mock/confirm/{pid}", 
                                   headers={"Authorization": f"Bearer {admin_token}"})
            print(f"Confirm Status: {conf_res.status_code}")
            print(f"Confirm Body: {conf_res.text}")
        else:
            print(f"Checkout Failed: {res.text}")
    except Exception as e:
        print(f"Err: {e}")

    # 2. Check My Challenges
    res = requests.get(f"{BASE_URL}/challenges/my", headers={"Authorization": f"Bearer {admin_token}"})
    if res.status_code == 200:
        data = res.json()
        print(f"Active count: {len(data['active_challenges'])}")
        print(f"All count: {len(data['all_challenges'])}")
        
        # Check if nested challenge exists
        if data['active_challenges']:
            first = data['active_challenges'][0]
            has_nested = 'challenge' in first
            print(f"Has nested 'challenge': {has_nested}")
            if has_nested:
                print(f"Challenge name: {first['challenge'].get('name', 'N/A')}")
                print(f"Max trade qty: {first['challenge'].get('max_trade_quantity', 'N/A')}")
    else:
        print(f"Fetch failed: {res.text}")
        
    print("DEBUG END")
