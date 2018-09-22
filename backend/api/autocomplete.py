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

from utils.ngram_extractor import ngramExtract

import time

wordSet = None
wsdict = {}


def updateWordset(col):
    """ Initialize wordSet from preexisting collections """
    global wordSet, wsdict, alphaNumeric
    wordSet = set()

    startTime = time.time()

    for (fld,) in col.db.execute("select flds from notes"):
        try:
            wordSet.update(wsdict[fld])
        except KeyError:
            words = ngramExtract(fld)
            words = set(words)
            wsdict[fld] = words
            wordSet.update(words)

    wordSet = preprocessList(wordSet)
    print('[updateWordset] Collected %d words in %.2fs' %
          (len(wordSet), time.time() - startTime))


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
