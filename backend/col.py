from anki import Collection
import os

db_path = os.path.join(
    os.path.dirname(__file__),
    'testdata/collection.anki2'
)

mainCol = None


class Col(object):
    def __enter__(self):
        global mainCol
        if not mainCol:
            mainCol = Collection(db_path, log=True)
        return mainCol
    def __exit__(self, type, value, trace_back):
        mainCol.save()
