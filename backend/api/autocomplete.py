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
import time

wordset = None
wsdict = {}
alphaNumeric = re.compile("[a-zA-Z][a-zA-Z0-9]{4,}")


def getWordset(col):
    """ Initialize wordSet from preexisting collections """
    global wordset, wsdict, alphaNumeric
    wordset = set()

    for (fld,) in col.db.execute("select flds from notes"):
        try:
            wordset.update(wsdict[fld])
        except KeyError:
            words = [w.lower() for w in alphaNumeric.findall(fld)]
            wsdict[fld] = words
            wordset.update(words)

    wordset = preprocessList(wordset)


with Col() as col:
    getWordset(col)
    print(len(wordset))
    start = time.time()
    print(fast_fuzzymatchBatch(preprocess('test'), wordset))
    print(time.time() - start)


@registerApi('word_autocmplete')
def listDeck(msg):
    with Col() as col:
        deckNames = [d['name'] for d in col.decks.all()]
        deckNames.sort()
        return emit.emitResult(deckNames)
