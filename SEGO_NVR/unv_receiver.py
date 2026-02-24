import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

def run_receiver(listen_host, listen_port, on_event):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            return

        def do_POST(self):
            length = int(self.headers.get("Content-Length", "0") or "0")
            raw = self.rfile.read(length) if length else b""

            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")

            try:
                payload = json.loads(raw.decode("utf-8", errors="replace"))
            except Exception:
                return

            on_event(self.path, payload)

    httpd = ThreadingHTTPServer((listen_host, listen_port), Handler)
    httpd.serve_forever()