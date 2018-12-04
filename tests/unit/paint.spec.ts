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

import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import PaintVue from '@/components/Paint.vue'
import { sleep } from '@/utils/promiseUtil'
import testImageUrl from './testdata/paint.test.png'

function getCanvasPixel (ctx: CanvasRenderingContext2D, x: number, y: number) {
  const p = ctx.getImageData(x, y, 1, 1).data
  return '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6)
}

function rgbToHex (r: number, g: number, b: number) {
  if (r > 255 || g > 255 || b > 255) {
    throw new Error('Invalid color component')
  }
  return ((r << 16) | (g << 8) | b).toString(16)
}

describe('Paint.vue', () => {
  it('loads initial images well', async () => {
    const wrapper = shallowMount(PaintVue, {
      propsData: { value: testImageUrl }
    })
    await sleep(500)  // Wait for image to load
    const canvas = wrapper.find('canvas').element as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    expect(canvas.width).to.equal(125)
    expect(canvas.height).to.equal(100)
    expect(getCanvasPixel(ctx, 0, 0)).to.equal('#ffffff')
  })
})
