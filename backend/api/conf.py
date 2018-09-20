from utils import (
    Col,
    registerApi,
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
