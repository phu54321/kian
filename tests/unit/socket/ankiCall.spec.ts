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

import ankiCall, { setMainSocket } from '@/api/ankiCall'
import { assert } from 'chai'
import { SocketIOMock } from '../socketHelper'
import { sleep } from '@/utils/promiseUtil'

describe('ankiCall', () => {
  it('should work', async () => {
    const sock = new SocketIOMock()
    setMainSocket(sock)

    const callPromise = ankiCall('test api', {
      testdata: 'test message'
    })
    await sleep(100)

    const { syncKey, apiType, testdata } = sock.popSendMessage()!!.args
    assert.equal(apiType, 'test api')
    assert.equal(testdata, 'test message')

    sock.addRecv('msg', {
      syncKey,
      result: {
        data: testdata,
        test: 'ok'
      }
    })

    const ret = await callPromise
    assert.deepEqual(ret, { data: 'test message', test: 'ok' })
  })
})
