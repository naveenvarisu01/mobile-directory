from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import re

app = Flask(__name__)

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*")
if ALLOWED_ORIGINS == "*":
    CORS(app)
else:
    CORS(app, origins=ALLOWED_ORIGINS)

DATA_FILE = os.environ.get("DATA_FILE", "data.json")

ALLOWED_STATES = [
    "Tamil Nadu",
    "Kerala",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana",
]

def load_data():
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def validate_entry(entry):
    errors = []

    number = entry.get("number", "").strip()
    place = entry.get("place", "").strip()
    district = entry.get("district", "").strip()
    state = entry.get("state", "").strip()

    if not re.fullmatch(r"[6-9]\d{9}", number):
        errors.append("Invalid mobile number. Use 10 digits starting with 6-9.")

    if not place:
        errors.append("Place is required.")
    if not district:
        errors.append("District is required.")
    if not state:
        errors.append("State is required.")
    elif state not in ALLOWED_STATES:
        errors.append(f"State must be one of: {', '.join(ALLOWED_STATES)}")

    return errors

@app.route("/states", methods=["GET"])
def states():
    return jsonify(ALLOWED_STATES)

@app.route("/add", methods=["POST"])
def add_number():
    try:
        entry = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON body"}), 400

    errors = validate_entry(entry)
    if errors:
        return jsonify({"errors": errors}), 400

    data = load_data()

    if any(d.get("number") == entry["number"] for d in data):
        return jsonify({"error": "Number already exists"}), 409

    normalized = {
        "number": entry["number"],
        "place": entry["place"].strip().title(),
        "district": entry["district"].strip().title(),
        "state": entry["state"].strip(),
    }

    data.append(normalized)
    save_data(data)
    return jsonify({"message": "Number added successfully!", "entry": normalized}), 201

@app.route("/search", methods=["GET"])
def search_number():
    district = (request.args.get("district") or "").strip().lower()
    place = (request.args.get("place") or "").strip().lower()
    state = (request.args.get("state") or "").strip().lower()

    data = load_data()
    results = []
    for d in data:
        if district and d.get("district", "").lower() != district:
            continue
        if place and d.get("place", "").lower() != place:
            continue
        if state and d.get("state", "").lower() != state:
            continue
        results.append(d)

    return jsonify(results), 200

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
