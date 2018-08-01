# Copyright (C) 2016 Alex Yatskov <alex@foosoft.net>
# Author: Alex Yatskov <alex@foosoft.net>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.


import json
import select
import socket
import time
import signal
import sys
import os
import logging
from api import apiDispatch
from col import detachCol

#
# Constants
#

API_VERSION = 1
NET_ADDRESS = '127.0.0.1'
NET_PORT = 28735
NET_BACKLOG = 5


#
# General helpers
#


#
# Helpers
#

def webApi(func):
    method = lambda *args, **kwargs: func(*args, **kwargs)
    setattr(method, 'api', True)
    return method


def makeBytes(data):
    return data.encode('utf-8')


def makeStr(data):
    return data.decode('utf-8')



#
# AjaxRequest
#

class AjaxRequest:
    def __init__(self, headers, body):
        self.headers = headers
        self.body = body


#
# AjaxClient
#

class AjaxClient:
    def __init__(self, sock, handler):
        self.sock = sock
        self.handler = handler
        self.readBuff = bytes()
        self.writeBuff = bytes()


    def advance(self, recvSize=1024):
        if self.sock is None:
            return False

        rList, wList = select.select([self.sock], [self.sock], [], 0)[:2]

        if rList:
            msg = self.sock.recv(recvSize)
            if not msg:
                self.close()
                return False

            self.readBuff += msg

            req, length = self.parseRequest(self.readBuff)
            if req is not None:
                self.readBuff = self.readBuff[length:]
                self.writeBuff += self.handler(req)

        if wList and self.writeBuff:
            length = self.sock.send(self.writeBuff)
            self.writeBuff = self.writeBuff[length:]
            if not self.writeBuff:
                self.close()
                return False

        return True


    def close(self):
        if self.sock is not None:
            self.sock.close()
            self.sock = None

        self.readBuff = bytes()
        self.writeBuff = bytes()


    def parseRequest(self, data):
        parts = data.split(makeBytes('\r\n\r\n'), 1)
        if len(parts) == 1:
            return None, 0

        headers = {}
        for line in parts[0].split(makeBytes('\r\n')):
            pair = line.split(makeBytes(': '))
            headers[pair[0].lower()] = pair[1] if len(pair) > 1 else None

        headerLength = len(parts[0]) + 4
        bodyLength = int(headers.get(makeBytes('content-length'), 0))
        totalLength = headerLength + bodyLength

        if totalLength > len(data):
            return None, 0

        body = data[headerLength : totalLength]
        return AjaxRequest(headers, body), totalLength


#
# AjaxServer
#

class AjaxServer:
    def __init__(self, handler):
        self.handler = handler
        self.clients = []
        self.sock = None
        self.resetHeaders()


    def setHeader(self, name, value):
        self.extraHeaders[name] = value


    def resetHeaders(self):
        self.headers = [
            ['HTTP/1.1 200 OK', None],
            ['Content-Type', 'text/json'],
            ['Access-Control-Allow-Origin', '*']
        ]
        self.extraHeaders = {}


    def getHeaders(self):
        headers = self.headers[:]
        for name in self.extraHeaders:
            headers.append([name, self.extraHeaders[name]])
        return headers


    def advance(self):
        if self.sock is not None:
            self.acceptClients()
            self.advanceClients()


    def acceptClients(self):
        rList = select.select([self.sock], [], [], 0)[0]
        if not rList:
            return

        clientSock = self.sock.accept()[0]
        if clientSock is not None:
            clientSock.setblocking(False)
            self.clients.append(AjaxClient(clientSock, self.handlerWrapper))


    def advanceClients(self):
        self.clients = list(filter(lambda c: c.advance(), self.clients))


    def listen(self):
        self.close()

        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.setblocking(False)
        self.sock.bind((NET_ADDRESS, NET_PORT))
        self.sock.listen(NET_BACKLOG)


    def handlerWrapper(self, req):
        if len(req.body) == 0:
            body = makeBytes('Anki_headless v.{}'.format(API_VERSION))
        else:
            try:
                params = json.loads(makeStr(req.body))
                body = makeBytes(json.dumps(self.handler(params)))
            except ValueError:
                body = makeBytes(json.dumps(None))
            except Exception:
                logging.exception('Exception from main handler')


        resp = bytes()

        self.setHeader('Content-Length', str(len(body)))
        headers = self.getHeaders()

        for key, value in headers:
            if value is None:
                resp += makeBytes('{}\r\n'.format(key))
            else:
                resp += makeBytes('{}: {}\r\n'.format(key, value))

        resp += makeBytes('\r\n')
        resp += body

        return resp


    def close(self):
        if self.sock is not None:
            self.sock.close()
            self.sock = None

        for client in self.clients:
            client.close()

        self.clients = []


#
# AnkiNoteParams
#


oldHandler = None

def onTerminate(sig, frame):
    signal.signal(signal.SIGUSR2, oldHandler)
    detachCol()
    os.kill(os.getpid(), signal.SIGUSR2)
    sys.exit(0)


LOG_FILENAME = 'server.out'

def main():
    logging.basicConfig(filename=LOG_FILENAME, level=logging.DEBUG)
    logging.getLogger().addHandler(logging.StreamHandler())

    global oldHandler
    server = AjaxServer(apiDispatch)
    oldHandler = signal.signal(signal.SIGUSR2, onTerminate)

    try:
        server.listen()
        logging.info('Starting Anki_Headless...')
        while True:
            server.advance()
            time.sleep(.001)

    except KeyboardInterrupt:
        pass
    finally:
        detachCol()

    

if __name__ == '__main__':
    main()
