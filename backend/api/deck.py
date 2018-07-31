from col import col
from .dispatchTable import registerApi
from . import emit

@registerApi('deck_list')
def listDeck():
    return emit.emitResult(
        [d['name'] for d in col().decks.all()]
    )
