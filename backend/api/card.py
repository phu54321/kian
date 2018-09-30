from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)

from .autocomplete import updateWordset


def getNidSet(col, cids):
    nidSet = set()
    for cardId in cids:
        card = col.getCard(cardId)
        nidSet.add(card.nid)
    return nidSet


@registerApi('card_get')
def getCard(msg):
    typeCheck(msg, {
        'cardId': int,
    })
    with Col() as col:
        cardId = msg['cardId']
        card = col.getCard(cardId)
        note = card.note()
        model = card.model()
        return emit.emitResult({
            'id': card.id,
            'deck': col.decks.get(card.did)['name'],
            'noteId': note.id,
            'model': model['name'],
            'fieldFormats': [{
                'name': fFormat['name'],
                'sticky': fFormat['sticky'],
            } for fFormat in model['flds']],
            'fields': note.fields,
            'tags': note.tags,
        })


@registerApi('card_update')
def updateCard(msg):
    typeCheck(msg, {
        'cardId': int,
        'deck': str,
        'fields': list,
        'tags': list
    })
    with Col() as col:
        card = col.getCard(msg['cardId'])
        note = col.getNote(card.nid)
        newDeckId = col.decks.byName(msg['deck'])['id']

        fields = msg['fields']
        tags = msg['tags']

        assert len(fields) == len(note.fields)

        note.fields[:] = fields
        note.tags = tags
        note.flush()

        card.did = newDeckId
        card.flush()

        updateWordset(col)

        return emit.emitResult(True)
