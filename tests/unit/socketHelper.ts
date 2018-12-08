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

import Vue from 'vue'
import { KianMainSocket } from '@/api/mainSocket'

interface MockMessage {
  event: string
  args?: any
}

type CallbackProcessor = (msg: any) => void

export class SocketIOMock implements KianMainSocket {
  sendMsgQueue: MockMessage[] = []
  recvMsgQueue: MockMessage[] = []
  isRecvProcessingQueued = false

  callbackMap = new Map<string, CallbackProcessor[]>()

  // Socket.io emulation
  /**
   * Used by client to emit messages
   * @param event
   * @param args
   */
  emit (event: string, args?: any) {
    this.sendMsgQueue.push({ event, args })
  }

  /**
   * Used by client to register event handlers
   * @param event
   * @param callback
   */
  on (event: string, callback: (msg: any) => void) {
    if (!this.callbackMap.has(event)) {
      this.callbackMap.set(event, [callback])
    } else {
      this.callbackMap.get(event)!!.push(callback)
    }
  }

  /**
   * Pop message sent by client with `emit`
   */
  popSendMessage (): MockMessage | undefined {
    if (this.sendMsgQueue.length === 0) return
    return this.sendMsgQueue.splice(0, 1)[0]
  }

  /**
   * Add message to recv queue of the client
   * @param event Event type
   * @param args
   */
  addRecv (event: string, args?: any) {
    this.recvMsgQueue.push({ event, args })
    if (!this.isRecvProcessingQueued) {
      this.isRecvProcessingQueued = true
      Vue.nextTick(() => this.processRecvQueue())
    }
  }

  private processRecvQueue () {
    const msg = this.recvMsgQueue.splice(0, 1)[0]
    if (this.recvMsgQueue.length) {
      Vue.nextTick(() => this.processRecvQueue())
    }

    const { event, args } = msg
    const callbacks = this.callbackMap.get(event)
    if (!callbacks) return
    callbacks.forEach((cb) => {
      cb(args)
    })
  }
}
