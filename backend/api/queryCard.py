from col import Col

from . import emit
from .dispatchTable import registerApi
from .card import encodeCard

@registerApi('query_cards')
def queryCards(msg):
    query = msg['query']

    with Col() as col:
        return emit.emitResult(col.findCards(query))

