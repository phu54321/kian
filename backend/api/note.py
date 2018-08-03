from col import col

from . import emit
from .dispatchTable import registerApi


@registerApi('note_info')
def getNoteInfo(msg):
    noteId = msg['noteId']
    note = col().getNote(noteId)
    fieldTemplateList = note.model()['flds']
    return emit.emitResult({
        'id': note.id,
        'model': note.model()['name'],
        'fields': [{
            'fieldFormat': fFormat,
            'value': v
        } for fFormat, v in zip(fieldTemplateList, note.fields)],
        'tags': note.tags,
    })


@registerApi('nid_from_cid')
def getNidFromCid(msg):
    cid = msg['cardId']
    return emit.emitResult(col().getCard(cid).nid)
