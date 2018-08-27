from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
    modelChanger,
)

from .card import getNidSet


@registerApi('model_list')
def getModelList(msg):
    with Col() as col:
        return emit.emitResult(col.models.allNames())

@registerApi('model_get')
def getModel(msg):
    typeCheck(msg, {
        'modelName': str,
    })
    with Col() as col:
        modelName = msg['modelName']
        model = col.models.byName(modelName)
        return emit.emitResult({
            'type': 'basic' if model['type'] == 0 else 'cloze',
            'name': model['name'],
            'templates': [
                {
                    'name': template['name'],
                    'front': template['qfmt'],
                    'back': template['afmt'],
                } for template in model['tmpls']
            ],
            'css': model['css'],
            'fieldFormats': [
                {
                    'name': fFormat['name'],
                    'sticky': fFormat['sticky'],
                } for fFormat in model['flds']
            ]
        })


@registerApi('card_update_model_batch')
def updateCardsModel(msg):
    typeCheck(msg, {
        'model': str,
        'cardIds': list,
    })
    with Col() as col:
        model = col.models.byName(msg['model'])
        nidSet = getNidSet(col, msg['cardIds'])
        modelChanger.changeNotesModel(col, nidSet, model)

        return emit.emitResult(True)
