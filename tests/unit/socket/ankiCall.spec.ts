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

import ankiCall from '@/api/ankiCall'
import { assert } from 'chai'
import { mockAnkiCall } from '../ankiCallHelper'

describe('ankiCall', async () => {
  it('should work', async () => {
    mockAnkiCall(((apiType, msg) => {
      assert.equal(apiType, 'test api')
      assert.equal(msg.testdata, 'test message')
      return {
        data: msg.testdata,
        test: 'ok'
      }
    }))
    const ret = await ankiCall('test api', {
      testdata: 'test message'
    })
    assert.deepEqual(ret, { data: 'test message', test: 'ok' })
  })
})
