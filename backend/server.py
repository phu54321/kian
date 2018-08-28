#!/usr/bin/env python3

from aiohttp import web
import socketio
import logging
import api
import sys

from utils.dispatchTable import apiDispatch


NET_PORT = 28735
LOG_FILENAME = 'server.out'

#######


sio = socketio.AsyncServer()

@sio.on('connect')
def connect(sid, environ):
    print("socket.io connected:", sid)

@sio.on('msg')
async def message(sid, data):
    syncKey = data['syncKey']
    del data['syncKey']

    result = apiDispatch(data)
    result['syncKey'] = syncKey
    await sio.emit('msg', result, room=sid)

@sio.on('disconnect')
def disconnect(sid):
    print('socket.io disconnected:', sid)

def main():
    logging.basicConfig(
        filename=LOG_FILENAME,
        level=logging.DEBUG,
        format="%(asctime)s;%(levelname)s;%(message)s"
    )
    logging.getLogger().addHandler(logging.StreamHandler())

    app = web.Application()
    sio.attach(app)
    web.run_app(app, host='127.0.0.1', port=NET_PORT)


if __name__ == '__main__':
    main()
