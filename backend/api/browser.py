from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
    modelChanger,
)

from anki.utils import htmlToTextLine
from .card import getNidSet


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
                'suspended': card.queue == -1,
            })
        return emit.emitResult(ret)


@registerApi('card_delete_batch')
def deleteCardBatch(msg):
    typeCheck(msg, {
        'cardIds': list,
    })
    with Col() as col:
        col.remCards(msg['cardIds'])
        return emit.emitResult(True)


@registerApi('card_update_deck_batch')
def updateCardsDeck(msg):
    typeCheck(msg, {
        'deck': str,
        'cardIds': list,
    })
    with Col() as col:
        newDeckId = col.decks.byName(msg['deck'])

        for cardId in msg['cardIds']:
            card = col.getCard(cardId)
            card.did = newDeckId
            card.flush()

        col.reset()
        return emit.emitResult(True)


@registerApi('card_update_model_batch')
def updateCardsModel(msg):
    typeCheck(msg, {
        'model': str,
        'cardIds': list,
    })
    with Col() as col:
        model = col.models.byName(msg['model'])
        nidSet = getNidSet(col, msg['cardIds'])
        modelChanger.changeNotesModel(col, nidSet, model)

        return emit.emitResult(True)


@registerApi('card_add_tag_batch')
def addCardTags(msg):
    typeCheck(msg, {
        'tags': list,
        'cardIds': list,
    })
    with Col() as col:
        tags = msg['tags']
        nidSet = getNidSet(col, msg['cardIds'])
        for nid in nidSet:
            note = col.getNote(nid)
            for tag in tags:
                note.addTag(tag)
            note.flush()

        return emit.emitResult(True)


@registerApi('card_remove_tag_batch')
def deleteCardTags(msg):
    typeCheck(msg, {
        'tags': list,
        'cardIds': list,
    })
    with Col() as col:
        tags = msg['tags']
        nidSet = getNidSet(col, msg['cardIds'])
        for nid in nidSet:
            note = col.getNote(nid)
            for tag in tags:
                note.delTag(tag)
            note.flush()

        return emit.emitResult(True)


@registerApi('card_toggle_marked_batch')
def toggleMarked(msg):
    typeCheck(msg, {
        'cardIds': list,
    })
    with Col() as col:
        nidSet = getNidSet(col, msg['cardIds'])
        notes = [col.getNote(nid) for nid in nidSet]
        if all(note.hasTag('marked') for note in notes):
            for note in notes:
                note.delTag('marked')
                note.flush()
        else:
            for note in notes:
                note.addTag('marked')
                note.flush()

        return emit.emitResult(True)


@registerApi('card_toggle_suspended_batch')
def toggleSuspended(msg):
    typeCheck(msg, {
        'cardIds': list,
    })
    with Col() as col:
        cardIds = msg['cardIds']
        cards = [col.getCard(cid) for cid in cardIds]
        if all(card.queue == -1 for card in cards):
            col.sched.unsuspendCards(cardIds)
        else:
            col.sched.suspendCards(cardIds)

        col.reset()
        return emit.emitResult(True)
