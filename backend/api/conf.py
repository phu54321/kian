from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi('config_get')
def getConf(msg):
    with Col() as col:
        conf = col.conf
        return emit.emitResult({
            'currentModel': col.models.get(conf['curModel'])['name'],
            'currentDeck': col.decks.get(conf['curDeck'])['name'],
        })


@registerApi('config_set_currentModel')
def setConfCurrentModel(msg):
    typeCheck(msg, {
        'model': str
    })
    with Col() as col:
        model = col.models.byName(msg['model'])
        if model is None:
            return emit.emitResult(False)
        col.models.setCurrent(model)
        return emit.emitResult(True)


@registerApi('config_set_currentDeck')
def setConfCurrentDeck(msg):
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
