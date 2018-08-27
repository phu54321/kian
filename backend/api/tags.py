from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)

from .card import getNidSet


@registerApi('tag_suggestions')
def queryTagSuggestions(msg):
    typeCheck(msg, {
        'query': str,
    })
    query = msg['query']
    with Col() as col:
        tagList = col.tags.all()
        tagList = [tag for tag in tagList if tag.startswith(query)]
        return emit.emitResult(tagList)


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

        return emit.emitResult(None)


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

        return emit.emitResult(None)
