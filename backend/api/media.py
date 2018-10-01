from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)

import base64
from send2trash import send2trash
import os


@registerApi('media_upload')
def uploadMedia(msg):
    typeCheck(msg, {
        'filename': str,
        'datab64': str,
    })

    filename = msg['filename']
    data = base64.b64decode(msg['datab64'])

    with Col() as col:
        mediaFilename = col.media.writeData(filename, data)
        print('UPLOAD', filename, len(data), mediaFilename)
        return emit.emitResult(mediaFilename)


@registerApi('media_check')
def mediaCheck(msg):
    with Col() as col:
        (nohave, unused, warnings) = col.media.check()
        return emit.emitResult({
            'missing': nohave,
            'unused': unused,
            'warnings': warnings,
        })


@registerApi('media_remove')
def mediaRemove(msg):
    typeCheck(msg, {
        'filenames': list
    })

    with Col() as col:
        filenames = msg['filenames']
        mdir = col.media.dir()
        deleteFailed = 0
        for fname in filenames:
            fullPath = os.path.join(mdir, fname)
            try:
                send2trash(fullPath)
            except Exception:
                print('Cannot delete file %s' % fullPath)
                deleteFailed += 1

        return emit.emitResult(deleteFailed)
