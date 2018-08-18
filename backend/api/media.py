from utils import (
    Col,
    registerApi,
    typeCheck,
    emit,
)

import base64

@registerApi('media_upload')
def getModelList(msg):
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
