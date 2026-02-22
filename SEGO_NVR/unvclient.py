import time
import requests
from requests.auth import HTTPDigestAuth

nvr_ip = "192.168.1.105"
username = "admin"
password = "P@ssword123"
client_ip = "192.168.1.50"
client_port = 9000


class UNVClient:
    def __init__(self, nvr_ip: str, username: str, password: str, scheme: str = "http"):
        self.nvr_ip = nvr_ip
        self.username = username
        self.password = password
        self.base = f"{scheme}://{nvr_ip}/LAPI/V1.0/"

    def sendrq(self, endpoint: str, method: str = "GET", payload=None, timeout: int = 10):
        url = self.base + endpoint
        r = requests.request(method.upper(),
            url,
            json=payload,
            auth=HTTPDigestAuth(self.username, self.password),
            headers={"Content-Type": "application/json"},
            timeout=timeout,)
        print("Status:", r.status_code)
        print(r.text)


    def subevents(self, client_ip: str, client_port: int, duration_s: int = 3000):
        endpoint = "System/Event/Subscription"
        payload = {
            "AddressType": 0,          
            "IPAddress": client_ip,
            "Port": int(client_port),
            "Duration": int(duration_s)
        }
        method = "POST"
        return self.sendrq(endpoint, method, payload,)
    
    def renew_subscription(self, sub_id: int, duration_s: int = 3000):
        endpoint = f"System/Event/Subscription{sub_id}"
        payload = {"Duration": int(duration_s)}
        return self.sendrq(endpoint, method="PUT", payload=payload)

    def get_device_info(self):
        endpoint = "System/DeviceInfo"
        return self.sendrq(endpoint, method="GET")

