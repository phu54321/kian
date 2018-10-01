from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)
from utils.col import (
    db_path,
    forceCloseCol,
    mainColLock
)

import time
import traceback
from queue import Queue
from threading import Thread

from anki import Collection
from anki.sync import (
    Syncer,
    RemoteServer,
    FullSyncer,
    MediaSyncer,
    RemoteMediaServer,
)

from anki.hooks import (
    addHook, remHook
)


# Sync thread
######################################################################


syncThread = None
syncMessageQueue = Queue()


@registerApi
def sync(msg):
    global syncThread

    if not msg['authKey']:
        typeCheck(msg, {
            'email': str,
            'password': str,
        })
        hKey = None
        auth = (msg['email'], msg['password'])
    else:
        hKey = msg['authKey']
        auth = None

    # Free existing collection connection  to make it accessible to syncThread
    forceCloseCol()
    syncThread = SyncThread(path=db_path, hkey=hKey, auth=auth)

    syncThread.listeners.append(
        lambda cmd, arg: syncMessageQueue.put((cmd, arg)))
    syncThread.start()
    return emit.emitResult(True)


@registerApi
def syncStatus(msg):
    if not syncThread:
        return emit.emitError('Not syncing')

    ret = []
    while not syncMessageQueue.empty():
        item = syncMessageQueue.get()
        ret.append(item)
    return emit.emitResult({
        'messages': ret,
        'completed': not syncThread.is_alive()
    })


@registerApi
def syncFullsync(msg):
    if not syncThread:
        return emit.emitError('Not syncing')

    typeCheck(msg, {
        'mode': str
    })

    syncThread.fullSyncChoice = msg['mode']


@registerApi
def syncTerminate(msg):
    global syncThread

    if not syncThread:
        return emit.emitError('Not syncing')

    syncThread.join()
    syncThread = None
    return emit.emitResult(True)


# SyncThread, from aqt/sync.py

class SyncThread(Thread):
    def __init__(self, path, hkey, auth=None, media=True, hostNum=None):
        super().__init__()
        self.path = path
        self.hkey = hkey
        self.auth = auth
        self.media = media
        self.hostNum = hostNum
        self._abort = 0  # 1=flagged, 2=aborting
        self.listeners = []

    def flagAbort(self):
        self._abort = 1

    def run(self):
        # init this first so an early crash doesn't cause an error
        # in the main thread
        self.syncMsg = ""
        self.uname = ""

        mainColLock.acquire()
        try:
            try:
                self.col = Collection(self.path, log=True)
            except Exception:
                self.fireEvent("corrupt")
                return
            self.server = RemoteServer(self.hkey, hostNum=self.hostNum)
            self.client = Syncer(self.col, self.server)
            self.sentTotal = 0
            self.recvTotal = 0

            def syncEvent(type):
                self.fireEvent("sync", type)

            def syncMsg(msg):
                self.fireEvent("syncMsg", msg)

            def sendEvent(bytes):
                if not self._abort:
                    self.sentTotal += bytes
                    self.fireEvent("send", str(self.sentTotal))
                elif self._abort == 1:
                    self._abort = 2
                    raise Exception("sync cancelled")

            def recvEvent(bytes):
                if not self._abort:
                    self.recvTotal += bytes
                    self.fireEvent("recv", str(self.recvTotal))
                elif self._abort == 1:
                    self._abort = 2
                    raise Exception("sync cancelled")

            addHook("sync", syncEvent)
            addHook("syncMsg", syncMsg)
            addHook("httpSend", sendEvent)
            addHook("httpRecv", recvEvent)

            # run sync and catch any errors
            try:
                self._sync()
            except Exception:
                err = traceback.format_exc()
                self.fireEvent("error", err)
            finally:
                # don't bump mod time unless we explicitly save
                self.col.close(save=False)
                remHook("sync", syncEvent)
                remHook("syncMsg", syncMsg)
                remHook("httpSend", sendEvent)
                remHook("httpRecv", recvEvent)

        finally:
            mainColLock.release()

    def _abortingSync(self):
        try:
            return self.client.sync()
        except Exception as e:
            if "sync cancelled" in str(e):
                self.server.abort()
                raise
            else:
                raise

    def _sync(self):
        if self.auth:
            # need to authenticate and obtain host key
            self.hkey = self.server.hostKey(*self.auth)
            if not self.hkey:
                # provided details were invalid
                return self.fireEvent("badAuth")
            else:
                # write new details and tell calling thread to save
                self.fireEvent("newKey", self.hkey)
        # run sync and check state
        try:
            ret = self._abortingSync()
        except Exception as e:
            log = traceback.format_exc()
            err = repr(str(e))
            if ("Unable to find the server" in err or
                    "Errno 2" in err or "getaddrinfo" in err):
                self.fireEvent("offline")
            elif "sync cancelled" in err:
                pass
            else:
                self.fireEvent("error", log)
            return
        if ret == "badAuth":
            return self.fireEvent("badAuth")
        elif ret == "clockOff":
            return self.fireEvent("clockOff")
        elif ret == "basicCheckFailed" or ret == "sanityCheckFailed":
            return self.fireEvent("checkFailed")
        # full sync?
        if ret == "fullSync":
            return self._fullSync()
        # save and note success state
        if ret == "noChanges":
            self.fireEvent("noChanges")
        elif ret == "success":
            self.fireEvent("success")
        elif ret == "serverAbort":
            pass
        else:
            self.fireEvent("error", "Unknown sync return code.")
        self.syncMsg = self.client.syncMsg
        self.uname = self.client.uname
        self.hostNum = self.client.hostNum
        # then move on to media sync
        self._syncMedia()

    def _fullSync(self):
        # tell the calling thread we need a decision on sync direction, and
        # wait for a reply
        self.fullSyncChoice = False
        self.localIsEmpty = self.col.isEmpty()
        self.fireEvent("fullSync")
        while not self.fullSyncChoice:
            time.sleep(0.1)
        f = self.fullSyncChoice
        if f == "cancel":
            return
        self.client = FullSyncer(self.col, self.hkey, self.server.client,
                                 hostNum=self.hostNum)
        try:
            if f == "upload":
                if not self.client.upload():
                    self.fireEvent("upbad")
            else:
                self.client.download()
        except Exception as e:
            if "sync cancelled" in str(e):
                return
            raise
        # reopen db and move on to media sync
        self.col.reopen()
        self._syncMedia()

    def _syncMedia(self):
        if not self.media:
            return
        self.server = RemoteMediaServer(
            self.col,
            self.hkey,
            self.server.client,
            hostNum=self.hostNum
        )
        self.client = MediaSyncer(self.col, self.server)
        try:
            ret = self.client.sync()
        except Exception as e:
            if "sync cancelled" in str(e):
                return
            raise
        if ret == "noChanges":
            self.fireEvent("noMediaChanges")
        elif ret == "sanityCheckFailed" or ret == "corruptMediaDB":
            self.fireEvent("mediaSanity")
        else:
            self.fireEvent("mediaSuccess")

    def fireEvent(self, cmd, arg=""):
        print(cmd, arg)
        for l in self.listeners:
            l(cmd, arg)
