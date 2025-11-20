import urllib.request
import json

BASE_URL = "http://localhost:5000"

def test_view_all():
    print("Testing View All (Search with no params)...")
    try:
        with urllib.request.urlopen(f"{BASE_URL}/search") as response:
            print(f"Status: {response.status}")
            data = json.loads(response.read().decode('utf-8'))
            print(f"Count: {len(data)}")
            print("First 3 items:", data[:3])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_view_all()
