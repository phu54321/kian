from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi('col_emptycards_get')
def getEmptyCards(msg):
    with Col() as col:
        return emit.emitResult(col.emptyCids())


@registerApi('col_card_remove_batch')
def removeCards(msg):
    typeCheck(msg, {
        'cardIds': list
    })
    with Col() as col:
        col.remCards(msg['cardIds'])
        return emit.emitResult(True)
