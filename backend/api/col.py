from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi
def colEmptycardsGet(msg):
    with Col() as col:
        return emit.emitResult(col.emptyCids())


@registerApi
def colCardRemoveBatch(msg):
    typeCheck(msg, {
        'cardIds': list
    })
    with Col() as col:
        col.remCards(msg['cardIds'])
        return emit.emitResult(True)


@registerApi
def colCheck(msg):
    with Col() as col:
        ret, ok = col.fixIntegrity()
        if not ok:
            return emit.emitError(ret)
        else:
            return emit.emitResult(ret)
