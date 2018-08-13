from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi('browser_query')
def listDeck(msg):
    typeCheck(msg, {
        'query': str,
    })
    query = msg['query']
    with Col() as col:
        return emit.emitResult(col.findCards(query))



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

            ret.append({
                'id': card.id,
                'deck': col.decks.get(card.did)['name'],
                'noteId': note.id,
                'ord': card.ord,
                'model': model['name'],
                'front': card.q(),
                'back': card.a(),
                'tags': note.tags,
            })
        return emit.emitResult(ret)