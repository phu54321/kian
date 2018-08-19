from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


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
