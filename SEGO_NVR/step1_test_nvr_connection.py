"""
Step 3: Properly Query Face Libraries
======================================
What we learned from Step 2:
  - PeopleLibraries endpoints EXIST and respond with JSON
  - They need POST requests with JSON bodies, not bare GETs  
  - Library 3 responded differently (50801) = it exists
  - StatusCode 50808 = wrong request format

This script uses the CORRECT request formats from the UNV 
Access Control API documentation.

The NVR's embedded HTTP server is fragile, so we:
  - Wait 5 seconds between each request
  - Use fresh connections each time (no connection pooling)
  - Retry on connection failures

Usage:
  python step3_query_libraries.py
"""

import requests
from requests.auth import HTTPDigestAuth
import json
import time
import urllib3

# ── CONFIGURATION ─────────────────────────────────────────────
NVR_IP   = "172.16.0.1"
USERNAME = "admin"
PASSWORD = "P@ssword123"     # ← Your NVR password
PORT     = 80
DELAY    = 5                   # Seconds between requests (be gentle)
# ──────────────────────────────────────────────────────────────

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

SCHEME   = "https" if PORT == 443 else "http"
BASE_URL = f"{SCHEME}://{NVR_IP}:{PORT}"


def lapi_request(method, path, payload=None, retries=3):
    """
    Make an LAPI request with retries and fresh connections.
    
    Key difference from Steps 1 & 2: we create a NEW session 
    for each request. UNV's HTTP server handles this better 
    than reusing connections.
    """
    url = f"{BASE_URL}{path}"
    
    for attempt in range(retries):
        try:
            # Fresh session each time — no connection reuse
            session = requests.Session()
            session.auth = HTTPDigestAuth(USERNAME, PASSWORD)
            session.verify = False
            session.headers.update({
                "Content-Type": "application/json",
                "Accept": "application/json"
            })
            
            if method == "GET":
                resp = session.get(url, timeout=15)
            elif method == "POST":
                resp = session.post(url, json=payload, timeout=15)
            elif method == "PUT":
                resp = session.put(url, json=payload, timeout=15)
            else:
                print(f"    Unsupported method: {method}")
                return None
            
            session.close()
            return resp
            
        except Exception as e:
            if attempt < retries - 1:
                wait = 3 * (attempt + 1)
                print(f"    Connection error, waiting {wait}s before retry {attempt + 2}/{retries}...")
                print(f"    ({type(e).__name__}: {str(e)[:100]})")
                time.sleep(wait)
            else:
                print(f"    Failed after {retries} attempts: {e}")
                return None


def show_response(resp):
    """Display response details."""
    print(f"    HTTP Status: {resp.status_code}")
    try:
        data = resp.json()
        print(f"    Response JSON:")
        print(f"    {json.dumps(data, indent=4)}")
        return data
    except ValueError:
        content = resp.text[:500]
        print(f"    Body: {content}")
        return None


def pause():
    """Pause between requests."""
    print(f"\n    ⏳ Waiting {DELAY}s before next request...\n")
    time.sleep(DELAY)


# ═══════════════════════════════════════════════════════════════
print("=" * 65)
print("  UNV NVR LAPI — Face Library Deep Dive")
print("  Target: " + BASE_URL)
print("=" * 65)
print()
print("  Taking it slow — 5 second gaps between requests.")
print("  This will take about 60 seconds to complete.")
print()


# ═══════════════════════════════════════════════════════════════
# REQUEST 1: Get all people libraries
# ═══════════════════════════════════════════════════════════════
print("─" * 65)
print("  REQUEST 1: List all people/face libraries")
print("  Method: GET /LAPI/V1.0/PeopleLibraries/BasicInfo")
print("─" * 65)

resp = lapi_request("GET", "/LAPI/V1.0/PeopleLibraries/BasicInfo")
libraries_data = None

if resp:
    data = show_response(resp)
    if data:
        libraries_data = data.get("Response", {}).get("Data", {})
        libs = libraries_data.get("LibList", [])
        if libs:
            print(f"\n    📚 Found {len(libs)} library(ies):")
            for lib in libs:
                print(f"       ID={lib.get('ID')} | Type={lib.get('Type')} | "
                      f"Name='{lib.get('Name','')}' | "
                      f"Persons={lib.get('PersonNum',0)} | "
                      f"Faces={lib.get('FaceNum',0)}")
else:
    print("    ❌ No response")

pause()


# ═══════════════════════════════════════════════════════════════
# REQUEST 2: Search for persons in library 3 (using POST)
# 
# From the UNV docs, searching persons requires POST with:
# {
#     "Num": 10,        ← how many results to return
#     "Offset": 0,      ← pagination offset
#     "PersonID": ""     ← empty = return all
# }
# ═══════════════════════════════════════════════════════════════
print("─" * 65)
print("  REQUEST 2: Search persons in Library 3 (POST)")
print("  Method: POST /LAPI/V1.0/PeopleLibraries/3/People/Info")
print("─" * 65)

search_payload = {
    "Num": 10,
    "Offset": 0
}

resp = lapi_request("POST", "/LAPI/V1.0/PeopleLibraries/3/People/Info", search_payload)
if resp:
    show_response(resp)
else:
    print("    ❌ No response")

pause()


# ═══════════════════════════════════════════════════════════════
# REQUEST 3: Try alternative search format
# Some NVR firmware versions use a slightly different structure
# ═══════════════════════════════════════════════════════════════
print("─" * 65)
print("  REQUEST 3: Search persons (alternative format)")
print("  Method: POST /LAPI/V1.0/PeopleLibraries/3/People")
print("─" * 65)

alt_search = {
    "Total": 10,
    "Offset": 0,
    "PersonInfo": []
}

resp = lapi_request("POST", "/LAPI/V1.0/PeopleLibraries/3/People", alt_search)
if resp:
    show_response(resp)
else:
    print("    ❌ No response")

pause()


# ═══════════════════════════════════════════════════════════════
# REQUEST 4: Try to get System Capabilities (retry from Step 2)
# ═══════════════════════════════════════════════════════════════
print("─" * 65)
print("  REQUEST 4: System Capabilities")
print("  Method: GET /LAPI/V1.0/System/Capabilities")
print("─" * 65)

resp = lapi_request("GET", "/LAPI/V1.0/System/Capabilities")
if resp:
    show_response(resp)
else:
    print("    ❌ No response")

pause()


# ═══════════════════════════════════════════════════════════════
# REQUEST 5: Try to add a TEST person to library 3
#
# From the UNV docs, adding a person requires POST with:
# {
#     "PersonNum": 1,
#     "PersonInfoList": [{
#         "PersonID": "test_001",
#         "LastChange": <unix_timestamp>,
#         "PersonName": "Test Person",
#         "ImageNum": 0,           ← 0 = no face image yet
#         "ImageList": []
#     }]
# }
#
# We start WITHOUT an image to test if the endpoint accepts 
# the request format. If this works, we know exactly how to 
# add faces with images next.
# ═══════════════════════════════════════════════════════════════
print("─" * 65)
print("  REQUEST 5: Add a test person to Library 3 (no image)")
print("  Method: POST /LAPI/V1.0/PeopleLibraries/3/People")
print("─" * 65)
print("  This tests if we can write to the library.")
print("  Creating 'Test Person' with no face image.\n")

current_time = int(time.time())

add_person_payload = {
    "PersonNum": 1,
    "PersonInfoList": [
        {
            "PersonID": "accessos_test_001",
            "LastChange": current_time,
            "PersonName": "Test Person",
            "TimeTemplateNum": 0,
            "IdentificationNum": 0,
            "ImageNum": 0,
            "ImageList": []
        }
    ]
}

print(f"    Payload:")
print(f"    {json.dumps(add_person_payload, indent=4)}")
print()

resp = lapi_request("POST", "/LAPI/V1.0/PeopleLibraries/3/People", add_person_payload)
if resp:
    show_response(resp)
else:
    print("    ❌ No response")

pause()


# ═══════════════════════════════════════════════════════════════
# REQUEST 6: Try alternative add endpoint
# Some firmware uses /People/Info for adding too
# ═══════════════════════════════════════════════════════════════
print("─" * 65)
print("  REQUEST 6: Add test person (alternative endpoint)")
print("  Method: POST /LAPI/V1.0/PeopleLibraries/3/People/Info")
print("─" * 65)

resp = lapi_request("POST", "/LAPI/V1.0/PeopleLibraries/3/People/Info", add_person_payload)
if resp:
    show_response(resp)
else:
    print("    ❌ No response")


# ═══════════════════════════════════════════════════════════════
print("\n" + "=" * 65)
print("  COMPLETE — Share the full output with me!")
print("=" * 65)
print("""
  What I'm looking for:
  
  1. REQUEST 1: What libraries exist? (IDs, names, face counts)
  2. REQUEST 2-3: Can we search persons? Which format works?
  3. REQUEST 4: What capabilities does the NVR report?
  4. REQUEST 5-6: Can we add persons? Which endpoint works?
  
  Even error responses are useful — the StatusCodes tell me 
  what the NVR expects differently.
""")