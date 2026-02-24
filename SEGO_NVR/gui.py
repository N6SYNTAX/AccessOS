import threading
import tkinter as tk
from tkinter import ttk, messagebox
import time

from unv_client import UNVClient
from unv_receiver import run_receiver

LISTEN_HOST = "0.0.0.0"
LISTEN_PORT = 9000

def popup(parent, title, lines):
    win = tk.Toplevel(parent)
    win.title(title)
    win.attributes("-topmost", True)

    box = ttk.Frame(win, padding=12)
    box.pack(fill="both", expand=True)

    ttk.Label(box, text=title, font=("Segoe UI", 16, "bold")).pack(anchor="w")
    for line in lines:
        ttk.Label(box, text=line, font=("Segoe UI", 11)).pack(anchor="w")

    ttk.Button(box, text="OK", command=win.destroy).pack(anchor="w", pady=(10, 0))


def main():
    root = tk.Tk()
    root.title("UNV FaceMatch")
    root.geometry("520x300")

    nvr_ip = tk.StringVar()
    username = tk.StringVar(value="admin")
    password = tk.StringVar()
    callback_ip = tk.StringVar()

    frm = ttk.Frame(root, padding=12)
    frm.pack(fill="both", expand=True)

    def row(r, label, var, show=None):
        ttk.Label(frm, text=label).grid(row=r, column=0, sticky="w", pady=4)
        ttk.Entry(frm, textvariable=var, width=35, show=show).grid(row=r, column=1, sticky="w", pady=4)

    row(0, "NVR IP", nvr_ip)
    row(1, "Username", username)
    row(2, "Password", password, show="*")
    row(3, "PC Callback IP", callback_ip)

    status = tk.StringVar(value="Idle")
    ttk.Label(frm, textvariable=status).grid(row=7, column=0, columnspan=2, sticky="w", pady=(10, 0))

    stop_keepalive = threading.Event()

    # these are set after Start
    session = None
    sub_id = None
    client_ip_saved = None
    receiver_started = False


    def on_event(path, payload):
        def show():
            if path.endswith("/System/Event/Notification/Alarm"):
                ai = payload.get("AlarmInfo", {})
                popup(root, "ALARM", [
                    f"AlarmType: {ai.get('AlarmType')}",
                    f"AlarmSrcID: {ai.get('AlarmSrcID')}",
                    f"RelatedID: {ai.get('RelatedID')}",
                ])

            elif path.endswith("/System/Event/Notification/PersonInfo"):
                pei = payload.get("PersonEventInfo", {})
                face_list = pei.get("FaceInfoList", [])
                f0 = face_list[0] if face_list else {}
                compare = f0.get("CompareInfo", {})
                person = compare.get("PersonInfo", {})

                popup(root, "PERSON INFO", [
                    f"Name: {person.get('PersonName')}",
                    f"Similarity: {compare.get('Similarity')}",
                    f"ChannelID: {f0.get('ChannelID')}",
                    f"RelatedID: {f0.get('RelatedID')}",
                ])

        root.after(0, show)


    def do_subscribe(show_popup=True):
        nonlocal session, sub_id, client_ip_saved

        if session is None or client_ip_saved is None:
            return

        resp = session.subscribe(client_ip_saved, LISTEN_PORT)
        data = resp.get("Response", {}).get("Data", {})  # {"ID":..., "Reference":..., ...}
        sub_id = data.get("ID")

        status.set(f"Subscribed OK. ID={sub_id}")
        if show_popup:
            popup(root, "SUBSCRIBED", [str(data)])


    def keepalive_loop():
        nonlocal sub_id
        # renew before 3000s expires (simple)
        while not stop_keepalive.is_set():
            time.sleep(2400)

            if stop_keepalive.is_set():
                break

            # If we don't have a sub_id yet, try subscribe
            if sub_id is None:
                try:
                    root.after(0, lambda: status.set("Re-subscribing..."))
                    do_subscribe(show_popup=False)
                except Exception:
                    continue
                continue

            # Try renew; if it fails, re-subscribe
            try:
                session.renew_subscription(sub_id, duration_s=3000)
                root.after(0, lambda: status.set(f"Renewed subscription. ID={sub_id}"))
            except Exception:
                try:
                    root.after(0, lambda: status.set("Renew failed -> re-subscribing..."))
                    do_subscribe(show_popup=False)
                except Exception:
                    pass


    def start():
        nonlocal session, receiver_started, client_ip_saved

        ip = nvr_ip.get().strip()
        user = username.get().strip()
        pw = password.get()
        client_ip = callback_ip.get().strip()

        if not ip or not user or not pw or not client_ip:
            messagebox.showerror("Missing", "Fill NVR IP, Username, Password, Callback IP")
            return

        if not receiver_started:
            threading.Thread(
                target=run_receiver,
                args=(LISTEN_HOST, LISTEN_PORT, on_event),
                daemon=True
            ).start()
            receiver_started = True
            status.set(f"Receiver listening on {LISTEN_HOST}:{LISTEN_PORT}")

        session = UNVClient(ip, user, pw)
        client_ip_saved = client_ip

        try:
            do_subscribe(show_popup=True)
        except Exception as e:
            popup(root, "ERROR", [str(e)])
            return

        stop_keepalive.clear()
        threading.Thread(target=keepalive_loop, daemon=True).start()


    def resubscribe_button():
        try:
            do_subscribe(show_popup=True)
        except Exception as e:
            popup(root, "ERROR", [str(e)])


    ttk.Button(frm, text="Start (Receiver + Subscribe)", command=start).grid(
        row=5, column=0, columnspan=2, sticky="w", pady=(8, 0)
    )
    ttk.Button(frm, text="Resubscribe", command=resubscribe_button).grid(
        row=6, column=0, columnspan=2, sticky="w"
    )

    root.mainloop()

if __name__ == "__main__":
    main()