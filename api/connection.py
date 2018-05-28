from flask import _app_ctx_stack as stack
from server import app

from anki import Collection
from anki.collection import _Collection

db_path = 'testdata/collection.anki2'


def col() -> _Collection:
    """Returns a basic collection.

    Returns:
        _Collection -- col
    """

    top = stack.top
    if not hasattr(top, 'col'):
        top.col = Collection(db_path, log=True)
    return top.col


@app.teardown_appcontext
def close_connection(exception):
    top = stack.top
    if hasattr(top, 'col'):
        top.col.close()
