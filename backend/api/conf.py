from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi('config_get')
def getConf(msg):
    with Col() as col:
        return emit.emitResult(col.conf)
