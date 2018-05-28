import sqlite3
from anki import Collection
from anki.collection import _Collection
from flask import Flask, _app_ctx_stack, jsonify

DATABASE = 'testdata/collection.anki2'

app = Flask(__name__)


def col() -> _Collection:
    """Returns a basic collection.

    Returns:
        _Collection -- col
    """

    top = _app_ctx_stack.top
    if not hasattr(top, 'col'):
        top.col = Collection(DATABASE, log=True)
    return top.col


@app.teardown_appcontext
def close_connection(exception):
    top = _app_ctx_stack.top
    if hasattr(top, 'col'):
        top.col.close()


@app.route('/deck/')
def listDeck():
    return jsonify(col().decks.allNames())


if __name__ == '__main__':
    app.run()
