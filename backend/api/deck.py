from col import col
from .dispatchTable import registerApi
from . import emit

@registerApi('deck_list')
def listDeck(msg):
    return emit.emitResult(
        [d['name'] for d in col().decks.all()]
    )

@registerApi('deck_due_tree')
def listDeckDue(msg):
    dueTree = col().sched.deckDueTree()
    def traverseDueTree(tree):
        result = []
        for name, deckId, rev, lrn, new, subTree in tree:
            result.append({
                'name': name,
                'newCount': new,
                'lrnCount': lrn,
                'revCount': rev,
                'subDecks': traverseDueTree(subTree)
            })
        return result
            
    return emit.emitResult(
        traverseDueTree(dueTree)
    )
