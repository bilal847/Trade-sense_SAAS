"""
Basic API test script for TradeSense Quant
This script tests the main API endpoints to ensure they're working correctly.
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:5000/api/v1"

def test_api_endpoints():
    print("Testing TradeSense Quant API endpoints...")
    
    # Test 1: Get health status
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/market/health")
        if response.status_code == 200:
            print("✓ Health endpoint working")
            print(f"  Response: {response.json()}")
        else:
            print(f"✗ Health endpoint failed with status {response.status_code}")
    except Exception as e:
        print(f"✗ Health endpoint error: {e}")
    
    # Test 2: Get instruments
    print("\n2. Testing instruments endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/market/instruments")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Instruments endpoint working")
            print(f"  Found {data.get('total', 0)} instruments")
        else:
            print(f"✗ Instruments endpoint failed with status {response.status_code}")
    except Exception as e:
        print(f"✗ Instruments endpoint error: {e}")
    
    # Test 3: Get challenges
    print("\n3. Testing challenges endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/challenges")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Challenges endpoint working")
            print(f"  Found {data.get('total', 0)} challenges")
        else:
            print(f"✗ Challenges endpoint failed with status {response.status_code}")
    except Exception as e:
        print(f"✗ Challenges endpoint error: {e}")
    
    # Test 4: Get monthly leaderboard
    print("\n4. Testing leaderboard endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/leaderboard/monthly")
        if response.status_code == 200:
            print("✓ Leaderboard endpoint working")
        else:
            print(f"✗ Leaderboard endpoint failed with status {response.status_code}")
    except Exception as e:
        print(f"✗ Leaderboard endpoint error: {e}")
    
    # Test 5: Get learning modules
    print("\n5. Testing learning endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/learning/modules")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Learning endpoint working")
            print(f"  Found {data.get('total', 0)} modules")
        else:
            print(f"✗ Learning endpoint failed with status {response.status_code}")
    except Exception as e:
        print(f"✗ Learning endpoint error: {e}")
    
    print("\nAPI testing completed!")

if __name__ == "__main__":
    test_api_endpoints()