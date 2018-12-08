// Copyright (C) 2018 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see "http://www.gnu.org/licenses/".

import { KianMainSocket } from '@/api/mainSocket'

let mainSocket: KianMainSocket

/**
 * Set main socket. You can mock ankiCall by registering mock socket with this.
 * @param newSocket Socket to use.
 */
export function setMainSocket (newSocket: KianMainSocket) {
  mainSocket = newSocket
  mainSocket.on('msg', Messagehandler)
}

const syncKeyHeader = Math.random().toString()
let lastSyncKey = 0

/**
 * Create unique message key
 */
function createMessageKey () {
  return `syncKey_${syncKeyHeader}_${lastSyncKey++}`
}

const callbackPromiseTable = new Map()

export default function ankiCall (apiType: string, data?: any) {
  if (!mainSocket) {
    throw new Error('Socket not yet initialized')
  }

  return new Promise<any>((resolve, reject) => {
    const messageKey = createMessageKey()
    callbackPromiseTable.set(messageKey, { resolve, reject })
    mainSocket.emit('msg', {
      apiType,
      syncKey: messageKey,
      ...data
    })
  })
}

interface IResponse {
  syncKey: string
  [key: string]: any
}

function Messagehandler (response: IResponse) {
  const { syncKey } = response
  const callback = callbackPromiseTable.get(syncKey)
  if (!callback) return

  const { resolve, reject } = callback
  callbackPromiseTable.delete(syncKey)

  if (response.error) return reject(new Error(response.error.toString()))
  return resolve(response.result)
}
