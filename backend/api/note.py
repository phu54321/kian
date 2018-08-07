from col import col

from . import emit
from .dispatchTable import registerApi


@registerApi('note_get')
def getNote(msg):
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


@registerApi('note_update')
def setNote(msg):
    noteId = msg['noteId']
    fields = msg['fields']
    tags = msg['tags']

    note = col().getNote(noteId)
    assert len(fields) == len(note.fields)
    note.fields[:] = fields
    note.tags = tags
    note.flush()
    return emit.emitResult(None)



@registerApi('nid_from_cid')
def getNidFromCid(msg):
    cid = msg['cardId']
    return emit.emitResult(col().getCard(cid).nid)
