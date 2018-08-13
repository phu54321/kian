from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi('query_cards')
def listDeck(msg):
    typeCheck(msg, {
        'query': str,
    })
    query = msg['query']
    with Col() as col:
        return emit.emitResult(col.findCards(query))

