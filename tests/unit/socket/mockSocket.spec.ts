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

import { createMockSocketPair } from './socketMock'
import { expect } from 'chai'

describe('Mock socket test', () => {
  it('should resolve emit well', (done) => {
    const { server, client } = createMockSocketPair()
    server.on('test', (args) => {
      expect(args.msg).to.eq('test message')
      done()
    })
    client.emit('test', { msg: 'test message' })
  })

  it('should resolve emit in queue order', (done) => {
    const { server, client } = createMockSocketPair()
    let state = 0
    server.on('test', (args) => {
      if (state === 0) {
        expect(args.msg).to.eq('test message 1')
      } else if (state === 1) {
        expect(args.msg).to.eq('test message 2')
        done()
      }
      state++
    })
    client.emit('test', { msg: 'test message 1' })
    client.emit('test', { msg: 'test message 2' })
  })
})
