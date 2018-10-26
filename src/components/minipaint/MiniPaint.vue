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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

<template lang='pug'>
iframe(ref='iframe', src='/minipaint/index.html', width='100%', height='100%')
</template>

<script>
import mime from 'mime-types'
import { sleep } from '@/utils/promiseUtil'
import { uploadImageFromBase64 } from '@/utils/uploadHelper'
import ErrorDialogVue from '@/components/ErrorDialog.vue'

function eventPassThrough (e) {
  const newEvent = new e.constructor(e.type, e)
  document.body.dispatchEvent(newEvent)

  // Prevent Ctrl+S event
  if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
    e.preventDefault()
  }
}

function domOnloadPromise (win) {
  return new Promise((resolve) => {
    win.addEventListener('load', resolve)
  })
}

function imgOnloadPromise (imgEl) {
  return new Promise((resolve) => {
    imgEl.onload = () => {
      resolve(imgEl)
    }
  })
}

function loadImage (src) {
  const imgEl = document.createElement('img')
  imgEl.src = src
  return imgOnloadPromise(imgEl)
}

export default {
  props: ['value'],

  data () {
    return {
      iframeWindow: null,
      internalValue: this.value
    }
  },

  async mounted () {
    await this.$nextTick()

    const iframeDOM = this.$refs.iframe
    const iframeWindow = this.iframeWindow = iframeDOM.contentWindow

    iframeWindow.addEventListener('keydown', eventPassThrough)
    iframeWindow.addEventListener('keyup', eventPassThrough)
    await domOnloadPromise(iframeWindow)

    const imgEl = await loadImage(this.value)

    // miniPaint has its own onload handler, but it is registered after domOnloadPromise
    // is registered. (mounted called before iframe rendering). Let that handler run first.
    while (!iframeWindow.Layers) await sleep(1)

    const newLayer = {
      name: 'Image',
      type: 'image',
      data: imgEl,
      width: imgEl.naturalWidth || imgEl.width,
      height: imgEl.naturalHeight || imgEl.height,
      width_original: imgEl.naturalWidth || imgEl.width,
      height_original: imgEl.naturalHeight || imgEl.height
    }

    await iframeWindow.Layers.insert(newLayer)
    iframeWindow.Layers.render(true)

    // Fixes cursor offset glitch
    iframeWindow.resetCursor()
  },

  watch: {
    async value (newValue) {
      const iframeDOM = this.$refs.iframe
      if (!iframeDOM) return
      const iframeWindow = iframeDOM.contentWindow
      if (!iframeWindow) return

      iframeWindow.Layers.reset_layers()

      const imgEl = await loadImage(newValue)

      const newLayer = {
        name: 'Image',
        type: 'image',
        data: imgEl,
        width: imgEl.naturalWidth || imgEl.width,
        height: imgEl.naturalHeight || imgEl.height,
        width_original: imgEl.naturalWidth || imgEl.width,
        height_original: imgEl.naturalHeight || imgEl.height
      }

      await iframeWindow.Layers.insert(newLayer)
      iframeWindow.Layers.render(true)

      // Fixes cursor offset glitch
      iframeWindow.resetCursor()
    }
  },

  methods: {
    onSave () {
      const { Layers } = this.iframeWindow
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      const dim = Layers.get_dimensions()
      tempCanvas.width = dim.width
      tempCanvas.height = dim.height
      Layers.convert_layers_to_canvas(tempCtx)

      const b64 = tempCanvas.toDataURL(mime.lookup(this.value)).split('base64,')[1]
      uploadImageFromBase64(this.value, b64).then(newImageUrl => {
        this.$emit('input', newImageUrl)
      }).catch(e => {
        ErrorDialogVue.openErrorDialog('Image editing error', 'Couldn\'t uploaded modified image')
      })
    }
  },
  name: 'mini-paint'
}
</script>

<style scoped lang='scss'>

iframe {
    border: none;
}

</style>
