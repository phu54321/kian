

import time

from col import Col

from . import emit
from .dispatchTable import registerApi


@registerApi('deck_list')
def listDeck(msg):
    with Col() as col:
        return emit.emitResult(
            [d['name'] for d in col.decks.all()]
        )

@registerApi('dashboard_deck_tree')
def listDeckDue(msg):
    with Col() as col:
        dueTree = col.sched.deckDueTree()
        def traverseDueTree(tree, prefix=''):
            result = []
            for name, deckId, rev, lrn, new, subTree in tree:
                deck = col.decks.get(deckId)
                result.append({
                    'name': name,
                    'fullname': prefix + name,
                    'newCount': new,
                    'lrnCount': lrn,
                    'revCount': rev,
                    'subDecks': traverseDueTree(subTree, prefix + name + '::'),
                    'collapsed': deck['collapsed']
                })
            return result
                
        return emit.emitResult(
            traverseDueTree(dueTree)
        )

@registerApi('deck_collapse')
def collapseDeck(msg):
    with Col() as col:
        deckName = msg['deckName']
        newCollapse = bool(msg['collapse'])
        deck = col.decks.byName(deckName)
        did = deck['id']
        if deck['collapsed'] != newCollapse:
            col.decks.collapse(did)

        return emit.emitResult(None)


@registerApi('deck_info')
def getDeckInfo(msg):
    with Col() as col:
        deckName = msg['deckName']
        deck = col.decks.byName(deckName)
        for dname, did, rev, lrn, new in col.sched.deckDueList():
            if dname == deckName:
                # SQL Code from More Overview Stats 2 addon
                col.decks.select(did)
                total, mature, young, unseen, suspended, due = col.db.first(
                        '''select
                        -- total
                        count(id),
                        -- mature
                        sum(case when queue = 2 and ivl >= 21 then 1 else 0 end),
                        -- young / learning
                        sum(case when queue in (1, 3) or (queue = 2 and ivl < 21) then 1 else 0 end),
                        -- unseen
                        sum(case when queue = 0 then 1 else 0 end),
                        -- suspended
                        sum(case when queue < 0 then 1 else 0 end),
                        -- due
                        sum(case when queue = 1 and due <= ? then 1 else 0 end)
                        from cards where did in %s
                        ''' % col.sched._deckLimit(), round(time.time()))

                # If there are no cards in current selected deck, 
                if total == 0:
                    mature = young = unseen = suspended = due = 0
                return emit.emitResult({
                    'name': deckName,
                    'due': {
                        'newCount': new,
                        'lrnCount': lrn,
                        'revCount': rev,
                    },
                    'stat': {
                        'mature': mature,
                        'young': young,
                        'total': total,
                        'unseen': unseen,
                        'suspended': suspended,
                        'due': due
                    }
                })
