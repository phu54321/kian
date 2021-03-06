from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)
import time


@registerApi
def deckList(msg):
    with Col() as col:
        deckNames = [d['name'] for d in col.decks.all()]
        deckNames.sort()
        return emit.emitResult(deckNames)


@registerApi
def deckAdd(msg):
    typeCheck(msg, {
        'deckName': str
    })
    with Col() as col:
        deckName = msg['deckName']
        col.decks.id(deckName, create=True)
        return emit.emitResult(True)


@registerApi
def dashboardDeckTree(msg):
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
            result.sort(key=lambda x: x['name'])
            return result

        return emit.emitResult(
            traverseDueTree(dueTree)
        )


@registerApi
def deckCollapse(msg):
    typeCheck(msg, {
        'deckName': str,
        'collapse': bool,
    })
    with Col() as col:
        deckName = msg['deckName']
        newCollapse = msg['collapse']
        deck = col.decks.byName(deckName)
        did = deck['id']
        if deck['collapsed'] != newCollapse:
            col.decks.collapse(did)

        return emit.emitResult(deck['collapsed'])


@registerApi
def deckInfo(msg):
    typeCheck(msg, {
        'deckName': str,
    })
    with Col() as col:
        deckNameReq = msg['deckName']
        for deckName, did, rev, lrn, new in col.sched.deckDueList():
            if deckName == deckNameReq:
                # SQL Code from More Overview Stats 2 addon
                col.decks.select(did)
                total, mature, young, unseen, suspended, due = col.db.first(
                    '''select
                        -- total
                        count(id),
                        -- mature
                        sum(case when queue = 2 and
                            ivl >= 21 then 1 else 0 end),
                        -- young / learning
                        sum(case when queue in (1, 3) or
                            (queue = 2 and ivl < 21) then 1 else 0 end),
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


@registerApi
def decknameFromDid(msg):
    with Col() as col:
        return emit.emitResult(col.decks.get(msg['did'], False)['name'])
