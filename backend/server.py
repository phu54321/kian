#!/usr/bin/env python3

from aiohttp import web
from aiohttp_index import IndexMiddleware
import socketio
import logging
import api
import sys
import os
import mimetypes

from utils.dispatchTable import apiDispatch
from utils.col import db_path


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

    app = web.Application(middlewares=[IndexMiddleware()])
    sio.attach(app)

    if hasattr(sys, 'frozen'):
        async def handler(request):
            path = str(request.rel_url)
            if path[0] == '/':
                path = path[1:]
            if path == '':
                path = 'index.html'
            print(path)

            resolvedPath = os.path.join('frontend/', path)
            print('try1', resolvedPath)
            if not os.path.exists(resolvedPath):
                resolvedPath = os.path.join(os.path.dirname(db_path), 'collection.media/', path)
                print('try2', resolvedPath)
                if not os.path.exists(resolvedPath):
                    return web.Response(status=404, text='Not found')

            try:
                with open(resolvedPath, 'rb') as f:
                    return web.Response(
                        content_type=mimetypes.guess_type(resolvedPath)[0],
                        body=f.read(),
                    )
            except:
                return web.Response(status=404, text='Not found')

        app.router.add_route('GET', '/{tail:.*}', handler)

        # print("Opening localhost:%d" % NET_PORT)
        # import webbrowser
        # webbrowser.open('http://localhost:%d/' % NET_PORT)

    web.run_app(app, host='127.0.0.1', port=NET_PORT)



if __name__ == '__main__':
    main()
