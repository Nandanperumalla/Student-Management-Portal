#!/usr/bin/env python3
"""Minimal static file server for the ERP prototype.
Avoids os.getcwd() (blocked in some sandboxes) by pinning an absolute root.
Usage: python3 serve.py [port]
"""
import os
import sys
import http.server
import socketserver

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"ERP running at http://localhost:{PORT}")
    httpd.serve_forever()
