import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://localhost:5000"

def test_smart_input():
    print("Testing Smart Input...")
    # Test case: Number + Place
    payload = {
        "text": "9876543210 Gandhipuram"
    }
    
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/add",
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.status}")
            print(f"Response: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"Failed: {e.code} {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Wait a bit for server to start
    time.sleep(2)
    test_smart_input()
