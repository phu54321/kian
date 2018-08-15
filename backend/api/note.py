from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)

from anki.notes import Note

@registerApi('note_get')
def getNote(msg):
    typeCheck(msg, {
        'noteId': int,
    })
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
    typeCheck(msg, {
        'noteId': int,
        'fields': list,
        'tags': list
    })
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
    typeCheck(msg, {
        'cardId': int
    })
    with Col() as col:
        cid = msg['cardId']
        return emit.emitResult(col.getCard(cid).nid)

@registerApi('cid_from_nid')
def getCidFromNid(msg):
    typeCheck(msg, {
        'noteId': int
    })
    with Col() as col:
        return emit.emitResult(col.findCards('nid:%d' % msg['noteId']))

@registerApi('note_add')
def addNote(msg):
    typeCheck(msg, {
        'deck': str,
        'model': str,
        'fields': list,
        'tags': list
    })
    with Col() as col:
        model = col.models.byName(msg['model'])
        deck = col.decks.byName(msg['deck'])
        fields = msg['fields']
        tags = msg['tags']


        note = Note(col, model)
        if len(note.fields) != len(fields):
            raise RuntimeError('Field number mismatch')
        note.fields[:] = fields
        note.tags[:] = tags

        model['did'] = deck['id']
        cardNum = col.addNote(note)

        return emit.emitResult({
            'noteId': note.id,
            'cardNum': cardNum
        })