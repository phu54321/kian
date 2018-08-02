
from col import col

from . import emit
from .dispatchTable import registerApi

@registerApi('reviewer_next_card')
def getNextScheduledCard(msg):
    """Fetch next scheduled card"""

    
    deckName = msg['deckName']
    deck = col().decks.byName(deckName)
    col().decks.select(deck['id'])

    card = col().sched.getCard()
    if card is None:
        return emit.emitResult(None)

    answerButtonCount = col().sched.answerButtons(card)

    return emit.emitResult({
        'id': card.id,
        'front': card.q(),
        'back': card.a(),
        'ansButtonCount': answerButtonCount,
    })

@registerApi('reviewer_answer_card')
def answerCard(msg):
    cardId, ease = int(msg['cardId']), int(msg['ease'])
    cardId = msg['cardId']
    card = col().getCard(cardId)
    ease = int(msg['ease'])

    col().sched.answerCard(card, ease)
    emit.emitResult(None)
