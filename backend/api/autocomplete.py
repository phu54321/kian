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
import re

wordSet = set()
wsdict = {}

def updateWordset(col):
    """ Initialize wordSet from preexisting collections """
    global wordSet, wsdict, alphaNumeric
    wordSet = set()

    startTime = time.time()

    for (fld,) in col.db.execute("select flds from notes order by id desc"):
        try:
            wordSet.update(wsdict[fld])
        except KeyError:
            fld = re.sub(r'< *script.*?>(.|\n)*?< */ *script *>', '', fld)
            words = ngramExtract(fld)
            words = set(words)
            wsdict[fld] = words
            wordSet.update(words)

    wordSet = list(wordSet)
    print('[updateWordset] Collected %d words in %.2fs' %
          (len(wordSet), time.time() - startTime))


# Initial update
with Col() as col:
    updateWordset(col)


@registerApi
def getWordAutocomplete(msg):
    typeCheck(msg, {
        'query': str
    })
    matches = fast_fuzzymatchBatch(preprocess(msg['query']), wordSet)
    return emit.emitResult(matches)
