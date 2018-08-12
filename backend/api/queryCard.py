from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi('query_card')
def listDeck(msg):
    query = msg['query']
    start = msg.get('start', 0)
    end = msg.get('end', -1)
    with Col() as col:
        return emit.emitResult(col.findCards(query)[start:end])

