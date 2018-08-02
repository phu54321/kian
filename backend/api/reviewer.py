
from col import col

from . import emit
from .dispatchTable import registerApi


@registerApi('get_next_due_card')
def listDeck(msg):
    deckName = msg['deckName']
