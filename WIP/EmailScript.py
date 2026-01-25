import imaplib
import email
import requests
from bs4 import BeautifulSoup
from datetime import datetime, time
import test



MAILHOG_API = "http://localhost:32769/api/v2/messages"

response = requests.get(MAILHOG_API)
data = response.json()
messages = data["items"]

if not messages:
    raise RuntimeError("No emails found in MailHog")

latest_email = messages[0]


raw_body = latest_email["Content"]["Body"]


soup = BeautifulSoup(raw_body, "lxml")

def extract_value(label_text):
    label = soup.find(string=lambda s: s and label_text in s)
    if not label:
        return None

    value = label.find_next(string=True)
    return value.strip() if value else None

guest_name = extract_value("Guest")
check_in = extract_value("Check-in")
check_out = extract_value("Check-out")
listing = extract_value("Listing")
reservation_code = extract_value("Reservation code")


required_fields = {
    "guest_name": guest_name,
    "check_in": check_in,
    "check_out": check_out,
    "listing": listing,
    "reservation_code": reservation_code,
}
missing = [k for k, v in required_fields.items() if not v]
if missing:
    raise RuntimeError(f"Missing fields: {missing}")



LISTING_ACCESS_MAP = {
    "Sunshine Rise House": {
        "access_group": "AIRBNB_SUNSHINE_RISE",
        "doors": [101, 102, 103]
    }
}
def resolve_access(listing_name):
    if listing_name not in LISTING_ACCESS_MAP:
        raise RuntimeError(f"No access mapping for listing: {listing_name}")

    return LISTING_ACCESS_MAP[listing_name]


booking = {
    "guest_name": guest_name,
    "check_in": check_in,
    "check_out": check_out,
    "listing": listing,
    "reservation_code": reservation_code,
}
print(booking)


def compute_access_window(check_in_str, check_out_str):
    check_in_date = datetime.strptime(check_in_str, "%d %B %Y")
    check_out_date = datetime.strptime(check_out_str, "%d %B %Y")

    valid_from = datetime.combine(check_in_date.date(), time(14, 0))
    valid_to = datetime.combine(check_out_date.date(), time(10, 0))

    return valid_from, valid_to



def build_inception_user(booking):
    valid_from, valid_to = compute_access_window(
        booking["check_in"],
        booking["check_out"]
    )

    access = resolve_access(booking["listing"])

    username = f"airbnb_{booking['reservation_code']}".lower()

    user_payload = {
        "username": username,
        "firstName": booking["guest_name"].split()[0],
        "lastName": booking["guest_name"].split()[-1],
        "enabled": True,
        "validFrom": valid_from.isoformat(),
        "validTo": valid_to.isoformat(),
        "accessGroups": [access["access_group"]],
        "metadata": {
            "source": "airbnb",
            "reservationCode": booking["reservation_code"]
        }
    }

    return user_payload


def create_inception_user(token, user_payload):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    r = requests.post(
        f"{test.API_ROOT}/users",
        json=user_payload,
        headers=headers,
        verify=False
    )

    r.raise_for_status()
    return r.json()



def provision_airbnb_guest(booking):
    token = test.Login()
    user_payload = build_inception_user(booking)
    result = create_inception_user(token, user_payload)
    return result


result = provision_airbnb_guest(booking)
print("User created:", result["username"])






# IMAP_SERVER = "imap.gmail.com"
# EMAIL_ACCOUNT = "your_mailbox@gmail.com"
# EMAIL_PASSWORD = "your_app_password"

# mail = imaplib.IMAP4_SSL(IMAP_SERVER)
# mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
# mail.select("inbox")
