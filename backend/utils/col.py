from anki import Collection
from anki.collection import _Collection
import os, sys
from threading import Timer, Lock


## From https://stackoverflow.com/questions/15511363/what-is-the-most-convenient-way-to-use-dialogs-in-non-gui-app
def getDBPath():
    import win32ui, win32con
    dlg = win32ui.CreateFileDialog(
        1,
        None,
        None,
        win32con.OFN_OVERWRITEPROMPT|win32con.OFN_FILEMUSTEXIST,
        "Anki database|collection.anki2||")

    if dlg.DoModal() != win32con.IDOK:
        return None

    return dlg.GetPathNames()[0]


if hasattr(sys, 'frozen'):
    db_path = getDBPath()
    if not db_path:
        raise RuntimeError('Need database file')
else:
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
    def __enter__(self) -> _Collection:
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
    try:
        mainCol.save()
    finally:
        mainColLock.release()


def checkpoint(col, name):
    col.save(name)


def forceCloseCol():
    global mainCol
    mainColLock.acquire()
    try:
        if mainCol:
            mainCol.close()
            mainCol = None
    finally:
        mainColLock.release()
