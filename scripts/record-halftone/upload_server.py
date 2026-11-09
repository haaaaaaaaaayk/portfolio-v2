"""Tiny local receiver: the halftone page POSTs each rendered frame here and it's written to disk. Local only."""
import os
import re
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

OUT = sys.argv[1]
ORIGIN = "http://127.0.0.1:8765"
NAME = re.compile(r"^(frame-\d{4}\.jpg|poster\.jpg)$")


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        name = os.path.basename(self.path.strip("/"))
        if not NAME.match(name):
            self.send_response(400)
            self._cors()
            self.end_headers()
            return
        n = int(self.headers.get("Content-Length", 0))
        with open(os.path.join(OUT, name), "wb") as f:
            f.write(self.rfile.read(n))
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(b"ok")


HTTPServer(("127.0.0.1", 5601), H).serve_forever()
