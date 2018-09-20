from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi('conf_get')
def getConf(msg):
    with Col() as col:
        return emit.emitResult(col.conf)
