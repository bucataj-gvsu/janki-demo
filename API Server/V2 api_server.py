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
        self._set_headers()

    def do_GET(self):
        self._set_headers()
        #self.wfile.write("received get request".encode(encoding='utf-8'))
        if sleepy: time.sleep(0.75)
        j = open(filename, 'rb')
        shutil.copyfileobj(j, self.wfile)
        if j:
                j.close()

    def do_POST(self):
        '''Reads post request body'''
        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len)

        j = open(filename, 'wb')
        shutil.copyfileobj(io.BytesIO(post_body), j)

        self.send_response(201)
        self.end_headers()

        if j:
                j.close()

    def do_PUT(self):
        self.do_POST()

if __name__ == '__main__':
    with http.server.HTTPServer(("", port), MyHTTPRequestHandler) as httpd:
        httpd.serve_forever()

