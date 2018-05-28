from server import app
from api.connection import col
from api.emit import emitError, emitResult
from flask import request


@app.route('/deck')
def list_deck():
    """ Returns list of deck names """
    return emitResult(col().decks.allNames())


@app.route('/deckDue')
def list_deck_due():
    """ Returns dictionary mapping from deck name to deck due. """

    tree = col().sched.deckDueTree()
    # Flatten tree
    ret = {}
    def _format_due_tree(tree, prefix=''):
        for deck in tree:
            deckName, _, nCnt, lCnt, rCnt, subTree = deck
            ret[prefix + deckName] = {
                'newCount': nCnt,
                'lrnCount': lCnt,
                'revCount': rCnt,
            }
            _format_due_tree(subTree, '%s%s::' % (prefix, deckName))

    _format_due_tree(tree)
    return emitResult(ret)


@app.route('/deck/<deckname>/config', methods=['GET', 'POST'])
def deck_config(deckname):
    deck = col().decks.byName(deckname)
    if not deck:
        return emitError('No such deck')

    if request.method == 'GET':
        ret = {
            'collapsed': deck['collapsed'],
            'browserCollapsed': deck['browserCollapsed'],
            'deckConfigId': deck['conf'],
            'description': deck['desc'],
            'isDynamic': deck['dyn'],
        }
        return emitResult(ret)
    else:
        req = request.get_json()
        try:
            reqType = req['type']
            if reqType == 'collapse':
                newCollapse = bool(req['collapse'])
                if newCollapse == deck['collapsed']:
                    return emitResult(False)
                else:
                    col().decks.collapse(deck['id'])
                    return emitResult(True)
            return emitError('Unknown request type %s' % reqType)

        except (KeyError, TypeError) as e:
            return emitError(str(e))



        print(req)
        return emitResult(1)

@app.route('/deck/<deckname>/current')
def set_current_deck(deckname):
    """ Set 'current' deck. This is used for reviewing. """
    deck = col().decks.byName(deckname)
    if not deck:
        return emitError('No such deck')
    did = deck['id']
    col().decks.select(did)
    return emitResult(1)


@app.route('/deck/current')
def get_current_deck():
    """ Get 'current' deck. """
    deck = col().decks.current()
    return emitResult(deck['name'])
