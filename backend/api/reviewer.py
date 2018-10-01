from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)
from anki.utils import _
import logging


cardDict = {}
prevDeckName = None


@registerApi
def reviewerReset(msg):
    with Col() as col:
        col.reset()
        return emit.emitResult(None)


@registerApi
def reviewerNextCard(msg):
    """Fetch next scheduled card"""

    global prevDeckName

    typeCheck(msg, {
        'deckName': str,
    })

    with Col() as col:
        deckName = msg['deckName']
        deck = col.decks.byName(deckName)
        col.decks.select(deck['id'])

        if prevDeckName != deckName:
            col.reset()
        prevDeckName = deckName

        card = col.sched.getCard()
        if card is None:
            return emit.emitResult(None)

        answerButtonCount = col.sched.answerButtons(card)
        remaining = col.sched.counts()

        cardDict[card.id] = card

        return emit.emitResult({
            'cardId': card.id,
            'noteId': card.nid,
            'front': card.q(),
            'back': card.a(),
            'ansButtonCount': answerButtonCount,
            'remaining': {
                'new': remaining[0],
                'lrn': remaining[1],
                'rev': remaining[2],
            }
        })


@registerApi
def reviewerAnswerCard(msg):
    typeCheck(msg, {
        'cardId': int,
        'ease': int,
    })

    cardId, ease = int(msg['cardId']), int(msg['ease'])
    cardId = msg['cardId']
    card = cardDict[cardId]
    ease = int(msg['ease'])

    with Col() as col:
        col.sched.answerCard(card, ease)
        logging.info("Cid[%d] Reviewed with ease %d" % (cardId, ease))
        return emit.emitResult(True)


@registerApi
def reviewerUndo(msg):
    with Col() as col:
        if col.undoName() == _('Review'):
            cid = col.undo()
            card = col.getCard(cid)
            col.reset()
            return emit.emitResult(True)
        else:
            return emit.emitResult(False)
