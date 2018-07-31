from anki import Collection
import os

db_path = os.path.join(
    os.path.dirname(__file__),
    'testdata/collection.anki2'
)

mainCol = None

def col():
    global mainCol

    if mainCol is None:
        mainCol = Collection(db_path, log=True)

    return mainCol


def detachCol():
    if mainCol:
        mainCol.close()
