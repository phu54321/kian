from anki import Collection
import os

db_path = os.path.join(
    os.path.dirname(__file__),
    'testdata/collection.anki2'
)

mainCol = None

class Col(object):
    def __enter__(self):
        self.col = Collection(db_path, log=True)
        return self.col
    def __exit__(self, type, value, trace_back):
        self.col.close()
