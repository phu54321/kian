import ankiCall from '../ankiCall'
import { sleep } from '@/utils/promiseUtil'

export interface ISyncAuthInfo {
  email?: string
  password?: string
  authKey?: string
}

export interface ISyncCallback {
  onNewAuthkey?: (authKey: string | null) => any,
  onFullSyncRequest?: () => Promise<FullSyncOption>,
  onSyncMessage?: (msg: string) => any,
  onTransferUpdate?: (sent: number, recv: number) => any,
}

enum FullSyncOption {
  UPLOAD,
  DOWNLOAD,
  CANCEL
}

export async function issueSync (authInfo: ISyncAuthInfo, callbackMap: ISyncCallback) {
  await ankiCall('sync', {
    email: authInfo.email,
    password: authInfo.password,
    authKey: authInfo.authKey
  })

  const onNewAuthkey = callbackMap.onNewAuthkey || (() => true)
  const onFullSyncRequest = callbackMap.onFullSyncRequest
  const onSyncMessage = callbackMap.onSyncMessage || (() => true)
  const onTransferUpdate = callbackMap.onTransferUpdate || (() => true)

  // Some error message should be handled after sync_status cycle completes
  // So there should be some 'pending' error messages.
  let pendingErrorMsg = null
  let sent = 0
  let recv = 0

  while (true) {
    const { messages, completed } = await ankiCall('sync_status')
    for (const [cmd, arg] of messages) {
      if (cmd === 'badAuth') {
        onNewAuthkey(null)
        throw new Error('Invalid AnkiWeb ID/Password')
      } else if (cmd === 'newKey') {
        onNewAuthkey(arg)
      } else if (cmd === 'offline') {
        pendingErrorMsg = 'Internet offline'
      } else if (cmd === 'upbad') {
        pendingErrorMsg = 'Uploading failed.'
      } else if (cmd === 'send') {
        sent = arg
        if (onTransferUpdate) onTransferUpdate(sent, recv)
      } else if (cmd === 'recv') {
        recv = arg
        if (onTransferUpdate) onTransferUpdate(sent, recv)
      } else if (cmd === 'sync') {
        const type = arg[0]
        switch (type) {
          case 'login':
            onSyncMessage('Logon to AnkiWeb')
            break
          case 'upload':
            onSyncMessage('Performing full upload to AnkiWeb.')
            break
          case 'download':
            onSyncMessage('Performing full download from AnkiWeb.')
            break
          case 'sanity':
            onSyncMessage('Checking database.')
            break
          case 'findMedia':
            onSyncMessage('Checking media.')
            break
          case 'upgradeRequited':
            pendingErrorMsg = 'Deck upgrade required. Please visit AnkiWeb.'
            break
        }
      } else if (cmd === 'syncMsg') {
        onSyncMessage(arg)
      } else if (cmd === 'error') {
        throw new Error(arg)
      } else if (cmd === 'clockOff') {
        throw new Error('Check again your computer\'s clock.')
      } else if (cmd === 'checkFailed') {
        throw new Error('Database check failed.')
      } else if (cmd === 'noChanges') {
        onSyncMessage('No database changes')
      } else if (cmd === 'noMediaChanges') {
        onSyncMessage('No media changes')
      } else if (cmd === 'fullSync') {
        let requestedMode
        if (onFullSyncRequest) {
          requestedMode = await onFullSyncRequest()
        } else {
          requestedMode = FullSyncOption.CANCEL
          pendingErrorMsg = 'Fullsync callback not implemented'
        }
        const mode = {
          [FullSyncOption.UPLOAD]: 'upload',
          [FullSyncOption.DOWNLOAD]: 'download',
          [FullSyncOption.CANCEL]: 'cancel'
        }
        await ankiCall('sync_fullsync', { mode })
      }
    }
    if (completed) break
    await sleep(200)
  }

  if (pendingErrorMsg) throw new Error(pendingErrorMsg)
  return true
}
