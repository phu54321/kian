from col import Col

from . import emit
from .dispatchTable import registerApi


def encodeCard(col, card):
    note = card.note()
    model = card.model()
    return {
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
    }

@registerApi('card_get')
def getCard(msg):
    with Col() as col:
        cardId = msg['cardId']
        card = col.getCard(cardId)
        return emit.emitResult(encodeCard(col, card))


@registerApi('card_update')
def updateCard(msg):
    with Col() as col:
        card = col.getCard(msg['cardId'])
        note = col.getNote(card.nid)
        deck = col.decks.byName(msg['deck'])

        fields = msg['fields']
        tags = msg['tags']

        assert len(fields) == len(note.fields)

        note.fields[:] = fields
        note.tags = tags
        note.flush()

        card.did = deck['id']
        card.flush()
        return emit.emitResult(None)

