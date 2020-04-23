#!/usr/bin/python3

# from StackOverflow https://tinyurl.com/yd7vwlab

import sys
import http.server
import shutil
import io
import os
import time

filename = "./janki/bucataj/Japanese 1/profile.json"
sleepy = True

port = int(sys.argv[1])
print(f"Using port {port}")

class MyHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def _set_headers(self):
        content_len = os.path.getsize(filename)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Content-Length', str(content_len))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def do_HEAD(self):
        if sleepy: time.sleep(0.75)
        self._set_headers()

    def do_GET(self):
        self._set_headers()

        if sleepy: time.sleep(0.75)

        j = open(filename, 'rb')
        shutil.copyfileobj(j, self.wfile)

        if j:
                j.close()

    def do_OPTIONS(self):
        # See: https://stackoverflow.com/questions/8153832/xmlhttprequest-changes-post-to-option

        if sleepy: time.sleep(0.75)

        self.send_response(200)
        self.send_header("Content-Length", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST")
        self.send_header("Access-Control-Allow-Headers", "accept, content-type")
        self.send_header("Access-Control-Max-Age", "1728000")
        self.end_headers()

    def do_POST(self):
        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len)

        j = open(filename, 'wb')
        shutil.copyfileobj(io.BytesIO(post_body), j)

        if sleepy: time.sleep(0.75)

        self.send_response(201)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        if j:
                j.close()

    def do_PUT(self):
        self.do_POST()

if __name__ == '__main__':
    with http.server.HTTPServer(("", port), MyHTTPRequestHandler) as httpd:
        httpd.serve_forever()

