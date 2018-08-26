from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
    modelChanger,
)


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

@registerApi('card_update_deck_batch')
def updateCardsDeck(msg):
    typeCheck(msg, {
        'deck': str,
        'cardIds': list,
    })
    with Col() as col:
        newDeck = col.decks.byName(msg['deck'])

        for cardId in msg['cardIds']:
            card = col.getCard(cardId)
            card.did = newDeck['id']
            card.flush()

        col.reset()
        return emit.emitResult(None)


@registerApi('card_update_model_batch')
def updateCardsModel(msg):
    typeCheck(msg, {
        'model': str,
        'cardIds': list,
    })
    with Col() as col:
        model = col.models.byName(msg['model'])

        nidSet = set()
        for cardId in msg['cardIds']:
            card = col.getCard(cardId)
            nidSet.add(card.nid)

        modelChanger.changeNotesModel(col, nidSet, model)

        return emit.emitResult(None)