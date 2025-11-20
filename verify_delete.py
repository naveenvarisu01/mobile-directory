import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:5000"

def test_add_delete():
    # 1. Add a number
    print("Adding number...")
    payload = {
        "number": "9999999999",
        "place": "TestPlace",
        "district": "TestDistrict",
        "state": "Tamil Nadu"
    }
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/add",
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            print(f"Add status: {response.status}")
            print(f"Add response: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"Add failed: {e.code} {e.read().decode('utf-8')}")
        if e.code != 409: # Ignore if already exists
            return
    except Exception as e:
        print(f"Add failed: {e}")
        return

    # 2. Delete the number
    print("\nDeleting number...")
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/delete/9999999999",
            method='DELETE'
        )
        with urllib.request.urlopen(req) as response:
            print(f"Delete status: {response.status}")
            print(f"Delete response: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"Delete failed: {e.code} {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Delete failed: {e}")

if __name__ == "__main__":
    test_add_delete()
