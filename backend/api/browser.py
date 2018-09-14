from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)
from anki.utils import htmlToTextLine


@registerApi('browser_query')
def listDeck(msg):
    typeCheck(msg, {
        'query': str,
    })
    query = msg['query']
    with Col() as col:
        sortBy = msg.get('sortBy', 'createdAt')
        sortOrder = msg.get('sortOrder', 'desc')

        orderBy = {
            'id': 'c.id',
            'deck': 'n.did',
            'noteId': 'n.id',
            'model': 'n.mid',
            'preview': 'n.sfld collate nocase, c.ord',
            'createdAt': 'n.id, c.ord',
            'updatedAt': 'c.mod',
            'due': 'c.type, c.due',
        }[sortBy]

        cIds = col.findCards(query, orderBy)
        if sortOrder == 'desc':
            cIds.reverse()
        return emit.emitResult(cIds)


@registerApi('browser_get_batch')
def getCardsBatch(msg):
    typeCheck(msg, {
        'cardIds': list
    })
    with Col() as col:
        noteDict = {}
        cards = [col.getCard(cid) for cid in msg['cardIds']]
        ret = []

        for card in cards:
            try:
                note = noteDict[card.nid]
            except KeyError:
                note = noteDict[card.nid] = card.note()
            model = card.model()

            # Code from aqt/browser.py
            if card.odid:  # Special case: filtered decks
                due = '(filtered)'
            elif card.queue == 1:  # Learning card
                due = card.due
            elif card.queue == 0 or card.type == 0:  # New cards
                due = '(new card)'
            elif card.queue in (2, 3) or (card.type == 2 and card.queue < 0):
                due = col.crt + 86400 * card.due
            else:
                due = ''

            ret.append({
                'id': card.id,
                'deck': col.decks.get(card.did)['name'],
                'noteId': note.id,
                'ord': card.ord,
                'model': model['name'],
                'preview': htmlToTextLine(card.q(browser=True)),
                'tags': note.tags,
                'createdAt': card.id // 1000,
                'updatedAt': card.mod,
                'due': due,
                'type': card.type,
                'queue': card.queue,
            })
        return emit.emitResult(ret)
