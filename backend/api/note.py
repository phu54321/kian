import re

from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)

from anki.notes import Note
from anki.utils import _, htmlToTextLine

from .autocomplete import updateWordset


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

        updateWordset(col)

        return emit.emitResult(True)


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


# Automatic switch from basic to cloze

def isClozeNote(fields):
    for val in fields:
        if re.search(r'\{\{c(\d+)::', val):
            return True
    return False


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
        did = col.decks.byName(msg['deck'])['id']
        fields = msg['fields']
        tags = msg['tags']

        if not htmlToTextLine(fields[0]):
            return emit.emitError('First field should not be empty')

        if isClozeNote(fields) and model['type'] == 0:
            # Automatic Basic → Cloze
            if msg['model'] in ('Basic', _('Basic')):
                model = (
                    col.models.byName('Cloze') or
                    col.models.byName(_('Cloze'))
                )
            else:
                model = None
            if not model:
                return emit.emitError('Need a cloze note type for cloze notes')

        if not isClozeNote(fields) and model['type'] == 1:
            return emit.emitError('You need at least one cloze deletion.')

        note = Note(col, model)
        if len(note.fields) != len(fields):
            raise RuntimeError('Field number mismatch')
        note.fields[:] = fields
        note.tags[:] = tags

        model['did'] = did
        cardNum = col.addNote(note)

        updateWordset(col)

        return emit.emitResult({
            'noteId': note.id,
            'cardNum': cardNum
        })
