import traceback
from . import emit
import logging

_apiTable = {}

def registerApi(name):
    def _(func):
        _apiTable[name] = func
        return func
    return _

def apiDispatch(msg):
    if 'apiType' not in msg:
        return emit.emitError('Invalid argument')
    msgType = msg['apiType']
    if msgType not in _apiTable:
        return emit.emitError('Unknown api type %s' % msgType)
    
    try:
        logging.info('Got request %s' % msgType)
        logging.debug(str(msg))
        return _apiTable[msgType](msg)
    except Exception as e:
        traceback.print_exc()
        return {
            'error': traceback.format_exc()
        }
