import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "no-reply@airbnb.com"
msg["To"] = "bookings@test.local"
msg["Subject"] = "Reservation confirmed – Sunshine Rise House"

msg.set_content("This is a test Airbnb booking email.")

msg.add_alternative("""
<html>
  <body>
    <h2>Reservation confirmed</h2>

    <p><strong>Guest</strong><br>Jane Doe</p>
    <p><strong>Check-in</strong><br>12 March 2026</p>
    <p><strong>Check-out</strong><br>15 March 2026</p>
    <p><strong>Listing</strong><br>Sunshine Rise House</p>
    <p><strong>Reservation code</strong><br>HM4K2</p>
  </body>
</html>
""", subtype="html")

with smtplib.SMTP("localhost", 32768) as server:
    server.send_message(msg)

print("Test Airbnb email sent to MailHog")
