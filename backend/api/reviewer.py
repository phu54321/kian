
from col import Col
import logging

from . import emit
from .dispatchTable import registerApi


cardDict = {}


@registerApi('reviewer_next_card')
def getNextScheduledCard(msg):
    """Fetch next scheduled card"""

    with Col() as col:
        deckName = msg['deckName']
        deck = col.decks.byName(deckName)
        col.decks.select(deck['id'])

        card = col.sched.getCard()
        if card is None:
            return emit.emitResult(None)

        answerButtonCount = col.sched.answerButtons(card)

        cardDict[card.id] = card

        return emit.emitResult({
            'cardId': card.id,
            'noteId': card.nid,
            'front': card.q(),
            'back': card.a(),
            'ansButtonCount': answerButtonCount,
        })

@registerApi('reviewer_answer_card')
def answerCard(msg):
    cardId, ease = int(msg['cardId']), int(msg['ease'])
    cardId = msg['cardId']
    card = cardDict[cardId]
    ease = int(msg['ease'])

    col.sched.answerCard(card, ease)
    logging.info("Cid[%d] Reviewed with ease %d" % (cardId, ease))
    return emit.emitResult(None)
