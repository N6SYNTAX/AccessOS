import requests

class InceptionClient:
    def __init__(self, serial):
        self.base_url = f"http://{serial}/api/v1"
        self.session_id = None
        self.http = requests.Session()

    def login(self, username, password):
        url = f"{self.base_url}/authentication/login"
        response = self.http.post(url, json={
            "Username": username,
            "Password": password
        })
        data = response.json()
        self.session_id = data["UserID"]
        self.http.headers.update({"Cookie": f"LoginSessId={self.session_id}"})
        return self.session_id
    
    def get_headers(self):
        return {"Cookie": f"LoginSessId={self.session_id}"}
    
    def get_all_areas(self):
        url = f"{self.base_url}/control/area"
        response = self.http.get(url)
        print("=" * 50)
        print("RAW RESPONSE:")
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")
        print("=" * 50)
        return response.json()
        
    def get_doors(self):
        url = f"{self.base_url}/control/door"
        response = self.http.get(url)
        return response.json()
    
    def control_output(self, output_id):
        url = f"{self.base_url}/control/door/{output_id}/activity"
        body = {
            "Type": "ControlDoor",
            "DoorControlType": "Lock",
        }
        response = self.http.post(url,json= body)
        print({response.status_code, response.text})
        return response.json()
    

    