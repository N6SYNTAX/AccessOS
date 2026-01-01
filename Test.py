import requests
from flask import Flask, request, jsonify
from dataclasses import dataclass, field
from flask_cors import CORS



## CONSTANTS
API_ROOT = "http://in67434072.local/api/v1"
USERNAME = "AccessOS"
PASSWORD = "AccessOS"


# def getAPIVersion():
#     APIVersion = requests.get(f"{API_ROOT}/../protocol-version")
#     print("Status code:", APIVersion.status_code)
#     print("Body:", APIVersion.text)


app = Flask(__name__)
CORS(app)
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    icpserial = data["ICPSerial"]
    username = data["Username"]
    password = data["Password"]
    print(f"-------------------Attempting login:-----------------------------\nSystem: {icpserial}\nUsername: {username}\n-----------------------------------------------------------------------") 
    login_url = f"http://{icpserial}.local/api/v1/authentication/login"
    login_body = {
        "Username": username,
        "Password": password
    }
    login_resp = requests.post(login_url, json=login_body, timeout=5)
    print("Login status:", login_resp.status_code)
    print("Login body:", login_resp.text)

    data = login_resp.json()
    session_id = data["UserID"]
    return jsonify({
        "success": True,
        "UserID": session_id,
        "Username": username,
        }), session_id


CORS(app)
@app.route("/getAreas", methods=["POST"])
def getAreas():
    data = request.json
    icpserial = data["icpserial"]
    session_id = data["session_id"]
    areas_url = f"http://{icpserial}.local/api/v1/control/area"
    headers = {
        "Cookie": f"LoginSessId={session_id}"
    }
    areas_resp = requests.get(areas_url, headers=headers, timeout=5)
    print("Areas status:", areas_resp.status_code)
    print("Areas body:", areas_resp.text)

#getAreas(API_ROOT, authenticate(API_ROOT))

# def getAllDoors(session_id):
#     doors_url = f"{API_ROOT}/control/door"
#     headers = {
#         "Cookie": f"LoginSessId={session_id}"
#     }
#     doors_resp = requests.get(doors_url, headers=headers, timeout=5)
#     print("Doors status:", doors_resp.status_code)
#     print("Areas body:", doors_resp.text)
#     return doors_resp.json()

#getAllDoors(authenticate())

# def openDoor(session_id, door):
#     url = f"{API_ROOT}/control/door/{door}/activity"
#     headers = {
#         "Cookie": f"LoginSessId={session_id}",
#         "Content-Type": "application/json",
#     }
#     body = {
#         "Type": "ControlDoor",
#         "DoorControlType": "Open",
#         "Entity": "{door}"
#     }
#     resp = requests.post(url, headers=headers, json=body, timeout=5)
#     print("Unlock status code:", resp.status_code)
#     print("Unlock response text:", resp.text)

#     #resp.raise_for_status()
#     #return resp.json()

# def get_door_id_by_name(doors: list[dict], target_name: str) -> str | None:
#     for door in doors:
#         if door.get("Name") == target_name:
#             return door.get("ID")
#     return None

# def main():
#     session_id = login()
#     doors = getAllDoors(session_id)

#     print("\n--- Doors ---")
#     if not doors:
#         print("No doors returned.")
#         return

#     for door in doors:
#         name = door.get("Name")
#         door_id = door.get("ID")
#         reporting_id = door.get("ReportingID")
#         print(f"ReportingID: {reporting_id} | Name: {name} | ID: {door_id}")

#     doorname = "Inception Controller - Door 1"

#     openDoor(session_id, get_door_id_by_name(doors,doorname))
#     openDoor(session_id, get_door_id_by_name(doors, "Inception Controller - Door 2"))





if __name__ == "__main__":
    app.run(debug=True)