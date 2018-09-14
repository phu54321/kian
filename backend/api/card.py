from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


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
        newDeckId = col.decks.id(msg['deck'], create=True)

        fields = msg['fields']
        tags = msg['tags']

        assert len(fields) == len(note.fields)

        note.fields[:] = fields
        note.tags = tags
        note.flush()

        card.did = newDeckId
        card.flush()
        return emit.emitResult(True)


@registerApi('card_delete_batch')
def deleteCardBatch(msg):
    typeCheck(msg, {
        'cardIds': list,
    })
    with Col() as col:
        col.remCards(msg['cardIds'])
        return emit.emitResult(True)
