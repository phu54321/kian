#!/usr/bin/env python3

from aiohttp import web
import aiohttp_cors
from api import apiDispatch
import logging
import asyncio

async def postHandler(request):
    data = await request.json()
    print(data['apiType'])
    result = apiDispatch(data)
    return web.json_response(result)


NET_PORT = 28735

LOG_FILENAME = 'server.out'

def main():
    logging.basicConfig(
        filename=LOG_FILENAME,
        level=logging.DEBUG,
        format="%(asctime)s;%(levelname)s;%(message)s"
    )
    logging.getLogger().addHandler(logging.StreamHandler())

    app = web.Application()
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
    })

    resource = cors.add(app.router.add_resource("/"))
    cors.add(resource.add_route("POST", postHandler))
    web.run_app(app, port=NET_PORT)


if __name__ == '__main__':
    main()
