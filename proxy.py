#!/usr/bin/env python3
"""Local server for Device Inspector.

Serves this folder and proxies Sigfox + Connected Insight so the browser
can call them without CORS. Credentials stay in the browser; this process
only forwards the Authorization header.

    python proxy.py [port]

Default port is 8787. Requires Python 3.6+. No third-party packages.
"""

import json
import os
import socketserver
import sys
import threading
import urllib.error
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8787
SIGFOX_API_BASE = "https://api.sigfox.com/v2"
SIGFOX_LEGACY_API_BASE = "https://backend.sigfox.com/api"
FOXER_API_BASE = "https://api.foxeriot.com"


class ProxyServer(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


class ProxyHandler(SimpleHTTPRequestHandler):
    timeout = 3

    def do_GET(self):
        if self.path.startswith("/sigfox-proxy/"):
            self._proxy_to_sigfox()
        elif self.path.startswith("/sigfox-legacy-proxy/"):
            self._proxy_to_sigfox_legacy()
        elif self.path.startswith("/ci-proxy/"):
            self._proxy_to_foxer()
        else:
            super().do_GET()

    def do_OPTIONS(self):
        if self.path.startswith("/sigfox-proxy/") or self.path.startswith("/sigfox-legacy-proxy/") or self.path.startswith("/ci-proxy/"):
            self.send_response(204)
            self.end_headers()
        else:
            self.send_error(405)

    def _proxy_to_sigfox(self):
        sigfox_path = self.path[len("/sigfox-proxy/"):]
        self._forward(f"{SIGFOX_API_BASE}/{sigfox_path}", timeout=30)

    def _proxy_to_sigfox_legacy(self):
        sigfox_path = self.path[len("/sigfox-legacy-proxy/"):]
        self._forward(f"{SIGFOX_LEGACY_API_BASE}/{sigfox_path}", timeout=30)

    def _proxy_to_foxer(self):
        remote_path = self.path[len("/ci-proxy/"):]
        path_only = remote_path.split("?", 1)[0]
        if not path_only.startswith("api/v1/") or "://" in path_only:
            self._json_error(404, "Unsupported Connected Insight path")
            return
        self._forward(f"{FOXER_API_BASE}/{remote_path}", timeout=60)

    def _forward(self, url, timeout):
        auth = self.headers.get("Authorization", "")
        req = urllib.request.Request(url)
        if auth:
            req.add_header("Authorization", auth)
        req.add_header("Accept", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read()
                content_type = resp.headers.get("Content-Type", "application/json")
                self.send_response(resp.status)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        except urllib.error.HTTPError as exc:
            body = exc.read()
            self.send_response(exc.code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except urllib.error.URLError as exc:
            self._json_error(502, f"Cannot reach upstream API: {exc.reason}")
        except Exception as exc:
            self._json_error(500, str(exc))

    def _json_error(self, code, message):
        body = json.dumps({"error": message}).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        if args and str(args[0]).startswith(("GET /sigfox", "OPTIONS /sigfox", "GET /ci-proxy", "OPTIONS /ci-proxy")):
            super().log_message(fmt, *args)


def main():
    server = ProxyServer(("localhost", PORT), ProxyHandler)
    url = f"http://localhost:{PORT}"
    print(f"Device Inspector  ->  {url}")
    print("  Press Ctrl+C to stop.\n")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("\nStopped.")


if __name__ == "__main__":
    main()
