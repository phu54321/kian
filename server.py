import sqlite3
from flask import (
    Flask,
    _app_ctx_stack,
    jsonify
)

from anki import Collection
from anki.collection import _Collection

db_path = 'testdata/collection.anki2'

app = Flask(__name__)
app.url_map.strict_slashes = False


def col() -> _Collection:
    """Returns a basic collection.

    Returns:
        _Collection -- col
    """

    top = _app_ctx_stack.top
    if not hasattr(top, 'col'):
        top.col = Collection(db_path, log=True)
    return top.col


@app.teardown_appcontext
def close_connection(exception):
    top = _app_ctx_stack.top
    if hasattr(top, 'col'):
        top.col.close()


def emitResult(res):
    return jsonify({
        'error': None,
        'result': res
    })

def emitError(errmsg):
    return jsonify({
        'error': errmsg,
    })

import api

if __name__ == '__main__':
    app.run()
