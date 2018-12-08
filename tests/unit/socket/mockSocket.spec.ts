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

import { SocketIOMock } from '../socketHelper'
import { expect } from 'chai'

describe('Mock socket test', () => {
  it('should resolve emit well', async () => {
    const sock = new SocketIOMock()
    sock.emit('test', { msg: 'test message' })
    const msg = sock.popSendMessage()
    expect(msg).to.deep.eq({
      event: 'test',
      args: {
        msg: 'test message'
      }
    })
  })

  it('should resolve emit in queue order', async () => {
    const sock = new SocketIOMock()
    sock.emit('test', { msg: 'test message' })
    sock.emit('test2', { msg: 'test message2' })

    expect(sock.popSendMessage()).to.deep.eq({
      event: 'test',
      args: {
        msg: 'test message'
      }
    })

    expect(sock.popSendMessage()).to.deep.eq({
      event: 'test2',
      args: {
        msg: 'test message2'
      }
    })
    expect(sock.popSendMessage()).to.eq(undefined)
  })

  it('should accept event handlers', (done) => {
    const sock = new SocketIOMock()
    let firstHandlerCalled = false
    sock.on('msg', (args) => {
      expect(args).to.equal('test message')
      // tslint:disable-next-line:no-unused-expression
      expect(firstHandlerCalled).to.be.false
      firstHandlerCalled = true
    })
    sock.on('msg', (args) => {
      expect(args).to.equal('test message')
      // tslint:disable-next-line:no-unused-expression
      expect(firstHandlerCalled).to.be.true
      done()
    })
    sock.addRecv('msg', 'test message')
  })
})
