# Code from https://github.com/Arthur-Milchior/anki-change-note-type

from anki.utils import intTime
from anki.notes import Note


def getFieldMap(oldModel, newModel):
    oldLen = len(oldModel['flds'])
    newLen = len(newModel['flds'])
    return {
        i: i for i in range(min(oldLen, newLen))
    }


def getCardMap(oldModel, newModel):
    oldLen = len(oldModel['tmpls'])
    newLen = len(newModel['tmpls'])
    return {
        i: i for i in range(min(oldLen, newLen))
    }


def oldChange(self, m, nids, newModel, fmap, cmap):
    """Change the model of the nodes in nids to newModel
    currently, fmap and cmap are null only for tests.
    keyword arguments
    m -- the previous model of the notes
    nids -- a list of id of notes whose model is m
    newModel -- the model to which the cards must be converted
    fmap -- the dictionnary sending to each fields'ord of the old model a
            field'ord of the new model or to None.
    cmap -- the dictionnary sending to each card type's ord of the old model
            a card type's ord of the new model
    """
    assert newModel['id'] == m['id'] or (fmap and cmap)
    if fmap:
        self._changeNotes(nids, newModel, fmap)
    if cmap:
        self._changeCards(nids, m, newModel, cmap)
    self.col.genCards(nids)


def newChange(self, m, nids, newModel, fmap, cmap):
    """As change. As side effect, change nids of cards. Return new nids """
    new_nids = list(map(copyCards(self.col), nids))
    oldChange(self, m, new_nids, newModel, fmap, cmap)
    self.col.remNotes(nids)
    self.col._remNotes(nids)
    return new_nids


def timestampID(db, table, t=None):
    "Return a non-conflicting timestamp for table."
    # be careful not to create multiple objects without flushing them, or they
    # may share an ID.
    t = t or intTime(1000)
    while db.scalar("select id from %s where id = ?" % table, t):
        t += 1
    return t


# Taken from Copy.py
def copyCards(col):
    def _(nid):
        note = col.getNote(nid)
        model = note._model

        # Create new note
        note_copy = Note(col, model=model)
        # Copy tags and fields (all model fields) from original note
        note_copy.tags = note.tags
        note_copy.fields = note.fields
        new_id = timestampID(note.col.db, "notes", note.id)
        note_copy.id = new_id
        # Refresh note and add to database
        note_copy.flush()
        col.addNote(note_copy)
        nid_copy = note_copy.id

        cards_copy = note_copy.cards()
        cards = note.cards()
        ord_to_card_copy = {card.ord: card for card in cards_copy}
        for card in cards:
            ord = card.ord
            card_copy = ord_to_card_copy.get(ord)
            if card_copy:
                card.id = card_copy.id
                card.nid = nid_copy
            else:
                card.id = timestampID(col.db, "cards")
                card.nid = nid_copy
            card.flush()

        return new_id
    return _


def changeNotesModel(col, nids, newModel):
    for nid in nids:
        note = col.getNote(nid)
        oldModel = note.model()
        newChange(col.models, oldModel, [nid], newModel,
                  getFieldMap(oldModel, newModel),
                  getCardMap(oldModel, newModel))
    col.reset()
