import traceback
from . import emit
import logging
import asyncio

_apiTable = {}

def registerApi(name):
    def _(func):
        _apiTable[name] = func
        return func
    return _

async def apiDispatch(msg):
    if 'apiType' not in msg:
        return emit.emitError('Invalid argument')
    msgType = msg['apiType']
    if msgType not in _apiTable:
        return emit.emitError('Unknown api type %s' % msgType)

    try:
        logging.info('Got request %s' % msgType)
        return await asyncio.coroutine(_apiTable[msgType])(msg)
    except Exception as e:
        logging.error('error processing request: %s' % msg)
        traceback.print_exc()
        return {
            'error': traceback.format_exc()
        }
