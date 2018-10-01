import traceback
from . import emit
import logging
import asyncio
import re
import types

_apiTable = {}


def camelToSnakeCase(name):
    return re.sub(r'[A-Z][a-z]*', lambda match: '_' + match.group(0).lower(), name)


def registerApi(func):
    name = camelToSnakeCase(func.__name__)
    _apiTable[name] = func
    return func

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
