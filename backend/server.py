#!/usr/bin/env python3

from http.server import HTTPServer, BaseHTTPRequestHandler
from api import apiDispatch
from col import detachCol
import logging
import json
import signal
import os
from pathlib import Path
import urllib.parse
import sys
import mimetypes
from col import col

NET_PORT = 28735

class RequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/media/'):
            path = urllib.parse.unquote(self.path)
            mediaDir = col().media.dir()
            mediaPath = path[7:]
            mediaFullPath = os.path.join(mediaDir, mediaPath)

            # This will throw error if path traversal attack has been tried
            Path(mediaFullPath).relative_to(mediaDir)
            print(mediaFullPath)

            cType, cEncoding = mimetypes.guess_type(mediaPath)

            self.send_response(200)
            self.send_header('Content-Type', cType)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            self.wfile.write(open(mediaFullPath, "rb").read())



    def do_POST(self):
        contentLength = int(self.headers.get('content-length'))
        content = self.rfile.read(contentLength)
        data = json.loads(content.decode('utf-8'))

        self.do_OPTIONS() # Write headers
        try:
            result = apiDispatch(data)
            self.wfile.write(json.dumps(result).encode('utf-8'))
        except Exception:
            logging.exception('Exception from main handler')


oldHandler = None

def onTerminate(sig, frame):
    signal.signal(signal.SIGUSR2, oldHandler)
    detachCol()
    os.kill(os.getpid(), signal.SIGUSR2)
    sys.exit(0)


LOG_FILENAME = 'server.out'

def main():
    logging.basicConfig(
        filename=LOG_FILENAME,
        level=logging.DEBUG,
        format="%(asctime)s;%(levelname)s;%(message)s"
    )
    logging.getLogger().addHandler(logging.StreamHandler())

    global oldHandler
    oldHandler = signal.signal(signal.SIGUSR2, onTerminate)


    try:
        with HTTPServer(("127.0.0.1", NET_PORT), RequestHandler) as httpd:
            logging.info("Starting Anki_Headlass at port %s" % NET_PORT)
            httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        detachCol()

    

if __name__ == '__main__':
    main()
