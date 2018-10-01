from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
    fuzzyMatch,
)


@registerApi
def tagSuggestions(msg):
    typeCheck(msg, {
        'query': str,
    })
    query = msg['query']
    with Col() as col:
        tagList = col.tags.all()
        tagList = [tag for tag in tagList if fuzzyMatch(query, tag)]
        return emit.emitResult(tagList)
