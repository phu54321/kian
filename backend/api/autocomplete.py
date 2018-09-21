from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)

from utils.fast_fuzzymatch import (
    preprocess,
    preprocessList,
    fast_fuzzymatchBatch,
)

import re

wordSet = None
wsdict = {}
alphaNumeric = re.compile("[a-zA-Z][a-zA-Z0-9]{4,}")


def updateWordset(col):
    """ Initialize wordSet from preexisting collections """
    global wordSet, wsdict, alphaNumeric
    wordSet = set()

    for (fld,) in col.db.execute("select flds from notes"):
        try:
            wordSet.update(wsdict[fld])
        except KeyError:
            words = [w.lower() for w in alphaNumeric.findall(fld)]
            wsdict[fld] = words
            wordSet.update(words)

    wordSet = preprocessList(wordSet)


# Initial update
with Col() as col:
    updateWordset(col)


@registerApi('get_word_autocomplete')
def listDeck(msg):
    typeCheck(msg, {
        'query': str
    })
    matches = fast_fuzzymatchBatch(preprocess(msg['query']), wordSet)
    return emit.emitResult(matches)
