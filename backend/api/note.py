from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)


@registerApi('note_get')
def getNote(msg):
    with Col() as col:
        noteId = msg['noteId']
        note = col.getNote(noteId)
        fieldTemplateList = note.model()['flds']
        return emit.emitResult({
            'id': note.id,
            'model': note.model()['name'],
            'fieldFormats': [{
                'name': fFormat['name'],
                'sticky': fFormat['sticky'],
            } for fFormat in fieldTemplateList],
            'fields': note.fields,
            'tags': note.tags,
        })

@registerApi('note_update')
def updateNote(msg):
    with Col() as col:
        noteId = msg['noteId']
        fields = msg['fields']
        tags = msg['tags']

        note = col.getNote(noteId)
        assert len(fields) == len(note.fields)

        note.fields[:] = fields
        note.tags = tags
        note.flush()
        return emit.emitResult(None)



@registerApi('nid_from_cid')
def getNidFromCid(msg):
    with Col() as col:
        cid = msg['cardId']
        return emit.emitResult(col.getCard(cid).nid)
