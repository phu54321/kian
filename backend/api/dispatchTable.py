import traceback
import functools
from . import emit

table = {}

def apiTable(name):
    def _(func):
        table[name] = func
        return func

def apiDispatch(msg):
    if 'type' not in msg:
        return emit.emitError('Invalid argument')
    msgType = msg['type']
    if msgType not in table:
        return emit.emitError('Unknown api type %s' % msgType)
    
    try:
        return table[msgType]()
    except Exception as e:
        traceback.print_exc()
        return {
            'error': str(e)
        }
