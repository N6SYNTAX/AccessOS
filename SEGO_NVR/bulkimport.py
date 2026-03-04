import base64
import csv
import re
import shutil
from pathlib import Path

import requests
from requests.auth import HTTPDigestAuth

# ========= EDIT THESE =========
NVR_IP = "192.168.1.105"
USER = "admin"
PASS = "P@ssword123"
LIB_ID = 1

SOURCE_DIR = Path("SEGO_NVR/monty_RSL")        # where patron_XXXX.jpg files are
OUTPUT_CSV = Path("Template.csv")
OUTPUT_IMAGE_DIR = Path("Image")  # CSV references ./Image/<file>

BATCH_SIZE = 1                    # start with 1 until it works, then set 6
ID_OFFSET = 10000                 # IMPORTANT: avoid clashing with existing IDs
# ==============================

# Template CSV defaults
DEFAULT_GENDER = "Unidentified"
DEFAULT_DOB = ""
DEFAULT_NATIONALITY = ""
DEFAULT_PROVINCE = ""
DEFAULT_CITY = ""
DEFAULT_ID_TYPE = "Other"

PAT = re.compile(r"patron_(\d+)\.jpg$", re.IGNORECASE)


def upload_batch(people_payload):
    url = f"http://{NVR_IP}/LAPI/V1.0/PeopleLibraries/{LIB_ID}/People"
    payload = {"Num": len(people_payload), "PersonInfoList": people_payload}
    r = requests.post(url, json=payload, auth=HTTPDigestAuth(USER, PASS))
    print("HTTP", r.status_code)
    print(r.text)
    # don't raise_for_status because UNV uses 599 for app errors
    return r.json()


def main():
    OUTPUT_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    files = sorted([p for p in SOURCE_DIR.glob("*.jpg") if PAT.search(p.name)])
    if not files:
        raise SystemExit(f"No patron_####.jpg files found in {SOURCE_DIR.resolve()}")

    # ---- 1) Build CSV rows + API payload ----
    csv_rows = []
    people_payload = []

    for idx, src in enumerate(files):
        # copy image into ./Image/
        dst = OUTPUT_IMAGE_DIR / src.name
        if not dst.exists():
            shutil.copy2(src, dst)

        # UNIQUE IDs: 10000, 10001, 10002, ...
        pid = ID_OFFSET + idx
        name = src.stem                  # patron_0023 etc
        id_no = str(pid)
        image_path = f"./Image/{dst.name}"

        csv_rows.append({
            "Name": name,
            "Gender (Unidentified  Male  Female)": DEFAULT_GENDER,
            "Date of Birth": DEFAULT_DOB,
            "Nationality": DEFAULT_NATIONALITY,
            "Province": DEFAULT_PROVINCE,
            "City": DEFAULT_CITY,
            "ID Type (ID Card  Passport  Driver's License  Other)": DEFAULT_ID_TYPE,
            "ID No.": id_no,
            "Image Path": image_path,
        })

        raw = dst.read_bytes()
        b64 = base64.b64encode(raw).decode("ascii")
        size_bytes = len(raw)  # <-- IMPORTANT: raw bytes size, not len(b64)

        people_payload.append({
            "PersonID": pid,
            "PersonCode": id_no,
            "PersonName": name,
            "ImageNum": 1,
            "ImageList": [{
                "FaceID": pid,
                "Name": dst.name,
                "Size": size_bytes,
                "Data": b64,
                "Type": 1,      # <-- IMPORTANT on some firmwares
            }]
        })

    # ---- 2) Write CSV (your required structure) ----
    fieldnames = [
        "Name",
        "Gender (Unidentified  Male  Female)",
        "Date of Birth",
        "Nationality",
        "Province",
        "City",
        "ID Type (ID Card  Passport  Driver's License  Other)",
        "ID No.",
        "Image Path",
    ]

    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(csv_rows)

    print(f"Wrote CSV: {OUTPUT_CSV.resolve()} ({len(csv_rows)} rows)")
    print(f"Images copied to: {OUTPUT_IMAGE_DIR.resolve()}")

    # ---- 3) Upload ----
    for i in range(0, len(people_payload), BATCH_SIZE):
        batch = people_payload[i:i + BATCH_SIZE]
        print(f"\nUploading batch {i//BATCH_SIZE + 1} ({len(batch)} people)")
        resp = upload_batch(batch)

        # Quick stop if API still unhappy (keeps it simple)
        r = resp.get("Response", {})
        if r.get("ResponseCode") != 0:
            print("STOPPING due to error:", r)
            break

    print("\nDone.")


if __name__ == "__main__":
    main()