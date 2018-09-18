from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
    fuzzyMatch,
)


@registerApi('tag_suggestions')
def queryTagSuggestions(msg):
    typeCheck(msg, {
        'query': str,
    })
    query = msg['query']
    with Col() as col:
        tagList = col.tags.all()
        tagList = [tag for tag in tagList if fuzzyMatch(query, tag)]
        return emit.emitResult(tagList)
