"""Tiny local receiver: the recording page POSTs a blob here and it's written into the scratchpad. Local only."""
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

OUT = sys.argv[1]
ALLOWED = {"fog.webm", "fog.mp4", "poster.jpg", "clean.png", "love.webm", "love-poster.jpg"}


class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "http://localhost:5199")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        name = os.path.basename(self.path.strip("/"))
        if name not in ALLOWED:
            self.send_response(400)
            self._cors()
            self.end_headers()
            return
        n = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(n)
        with open(os.path.join(OUT, name), "wb") as f:
            f.write(data)
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(f"saved {name} {len(data)} bytes".encode())


HTTPServer(("127.0.0.1", 5600), H).serve_forever()
