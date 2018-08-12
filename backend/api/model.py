from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi('model_list')
def getModelList(msg):
    with Col() as col:
        return emit.emitResult(col.models.allNames())

@registerApi('model_get')
def getModel(msg):
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
    