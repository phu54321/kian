from anki import Collection
import os
from threading import Timer, Lock

db_path = os.path.join(
    os.path.dirname(__file__),
    '../testdata/collection.anki2'
)


def debounce(wait):
    """ Decorator that will postpone a functions
        execution until after wait seconds
        have elapsed since the last time it was invoked. """
    def decorator(fn):
        def debounced(*args, **kwargs):
            def call_it():
                fn(*args, **kwargs)
            try:
                debounced.t.cancel()
            except(AttributeError):
                pass
            debounced.t = Timer(wait, call_it)
            debounced.t.start()
        return debounced
    return decorator

mainCol = None
mainColLock = Lock()

class Col(object):
    def __enter__(self):
        global mainCol
        mainColLock.acquire()
        if not mainCol:
            mainCol = Collection(db_path, log=True)
        return mainCol
    def __exit__(self, type, value, trace_back):
        saveMainCollection()
        mainColLock.release()


@debounce(1.0)
def saveMainCollection():
    global mainCol
    mainColLock.acquire()
    mainCol.save()
    mainColLock.release()
