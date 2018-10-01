from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi
def configGet(msg):
    with Col() as col:
        conf = col.conf
        return emit.emitResult({
            'confObject': conf,
            'currentModel': col.models.get(conf['curModel'])['name'],
            'currentDeck': col.decks.get(conf['curDeck'])['name'],
        })


@registerApi
def configSetCurrentModel(msg):
    typeCheck(msg, {
        'model': str
    })
    with Col() as col:
        model = col.models.byName(msg['model'])
        if model is None:
            return emit.emitResult(False)
        col.models.setCurrent(model)
        return emit.emitResult(True)


@registerApi
def configSetCurrentDeck(msg):
    typeCheck(msg, {
        'deck': str
    })
    with Col() as col:
        deck = col.decks.byName(msg['deck'])
        if deck is None:
            return emit.emitResult(False)
        col.decks.select(deck['id'])
        col.reset()
        return emit.emitResult(True)
