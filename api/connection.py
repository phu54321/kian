from flask import _app_ctx_stack as stack
import server
import os
from server import app

from anki import Collection
from anki.collection import _Collection

db_path = os.path.join(os.path.dirname(server.__file__),
                       'testdata/collection.anki2')

def col():
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
