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

<template lang="pug">
div
    h1.mb-4 JokboReader

    div(ref='scriptHolder')

    list-selector(
        taggable,
        v-model='deck',
        :optionsFunc='listDeck')

    input.mt-2(type="file", @change="onFileChange")
    b-alert.mt-2(show)
        | {{message}}
        span.ml-2(v-if='qaPairList.length') ({{qaPairList.length}} question found)

    div(v-show='qaPairList.length')
        b-row.imgRow
            .toolbar
                b-btn.mr-1(size='sm', variant='primary', @click='acceptQAPair', v-hotkey='"left"') Accept
                b-btn.mr-1(size='sm', variant='danger', @click='dismissQAPair', v-hotkey='"right"') Dismiss
            b-col
                canvas.downscale(ref='qImgCanvas')
            b-col
                canvas.downscale(ref='aImgCanvas')

    browser-view(:cardIds='addedCardIds', @updateCardIds='updateCardIds++')

</template>

<script lang='ts'>
import Jimp from 'jimp'
import { parseQAPair } from './qaPairParser'
import ListSelector from '@/components//common/ListSelector'
import { uploadImageFromBase64 } from '@/utils/uploadHelper'
import BrowserView from '@/components/browser/BrowserView'
import { listDeck, queryCardIds, addNote } from '@/api'
import Vue from 'vue'

const URLObj = window.URL
const PDFJS = (window as any).pdfjsLib

function imageDataFromJimp (img: Jimp) {
  return new ImageData(
    new Uint8ClampedArray(img.bitmap.data),
    img.bitmap.width, img.bitmap.height
  )
}

interface QAPair {
  qImgData: ImageData
  aImgData: ImageData
  page: number
}

export default Vue.extend({
  data () {
    return {
      qaPairList: [] as QAPair[],
      message: 'Select a file.',
      deck: 'Default',
      addedCardIds: [] as number[],
      updateCardIds: 0
    }
  },

  async asyncData () {
    const createdCards = await queryCardIds()
    return {
      addedCardIds: createdCards.slice(0, 20)
    }
  },

  mounted () {
    const scriptEl = document.createElement('script')
    scriptEl.setAttribute('src', '/pdfjs/build/pdf.js')
    ;(this.$refs.scriptHolder as HTMLDivElement).appendChild(scriptEl)
  },

  computed: {
    qaFirst (): QAPair {
      return this.qaPairList[0]
    },
    listDeck: () => listDeck
  },
  watch: {
    async updateCardIds () {
      const createdCards = await queryCardIds({
        query: '',
        sortBy: 'createdAt'
      })
      this.addedCardIds = createdCards.slice(0, 20)
    },
    qaFirst (v: QAPair) {
      const { qImgData: q, aImgData: a } = v

      const qImgCanvas = this.$refs.qImgCanvas as HTMLCanvasElement
      const aImgCanvas = this.$refs.aImgCanvas as HTMLCanvasElement

      qImgCanvas.width = q.width
      qImgCanvas.height = q.height
      qImgCanvas.getContext('2d')!.putImageData(q, 0, 0)

      aImgCanvas.width = a.width
      aImgCanvas.height = a.height
      aImgCanvas.getContext('2d')!.putImageData(a, 0, 0)
    }
  },
  components: {
    ListSelector,
    BrowserView
  },
  methods: {
    onFileChange (e: any) {
      const files = (e.target.files || e.dataTransfer.files) as FileList
      if (!files.length) return
      this.handlePdf(files[0])
    },

    async handlePdf (pdfFile: File) {
      this.message = `Processing ${pdfFile.name}...`
      const source = URLObj.createObjectURL(pdfFile)
      const pdf = await PDFJS.getDocument({ url: source })

      try {
        const startTime = new Date().getTime()
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!

        const pageNum = pdf.numPages
        for (let pageIndex = 1; pageIndex <= pageNum; pageIndex++) {
          const page = await pdf.getPage(pageIndex)
          const scale = 1.5
          const viewport = page.getViewport(scale)

          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({
            canvasContext: context,
            viewport: viewport
          })
          this.message = `Processing page ${pageIndex}/${pageNum}`
          this.handleImage(context.getImageData(0, 0, canvas.width, canvas.height), pageIndex)
        }
        this.message = 'Waiting for page extraction...'
        this.message = `Done! (elapsed ${((new Date().getTime() - startTime) / 1000).toFixed(2)}s) `
      } finally {
        pdf.destroy()
      }
    },

    handleImage (imageData: ImageData, page: number) {
      const qaPair = parseQAPair(new Jimp(imageData))
      qaPair.forEach(([q, a]) => {
        const qImgData = imageDataFromJimp(q)
        const aImgData = imageDataFromJimp(a)
        this.qaPairList.push({ qImgData, aImgData, page })
      })
    },

    async acceptQAPair () {
      const qImgCanvas = this.$refs.qImgCanvas as HTMLCanvasElement
      const aImgCanvas = this.$refs.aImgCanvas as HTMLCanvasElement

      const q = qImgCanvas.toDataURL('image/jpeg').split('base64,')[1]
      const a = aImgCanvas.toDataURL('image/jpeg').split('base64,')[1]
      const { page } = this.qaFirst

      this.qaPairList.splice(0, 1)

      const [qUrl, aUrl] = await Promise.all([
        uploadImageFromBase64('image.jpg', q),
        uploadImageFromBase64('image.jpg', a)
      ])

      await addNote({
        deck: this.deck,
        model: 'Basic',
        fields: [
          `<img src="${encodeURIComponent(qUrl)}">`,
          `<p><i>Page: ${page}</i></p><img src="${encodeURIComponent(aUrl)}">`
        ],
        tags: []
      })
      this.updateCardIds++
    },

    async dismissQAPair () {
      this.qaPairList.splice(0, 1)
    }
  }
})
</script>

<style scoped lang='scss'>

.imgRow {
    border: 1px solid #ccc;
    margin: 1em 0;
    padding: .3em;
    position: relative;

    .toolbar {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
    }

    .downscale {
        max-width: 95%;
    }
}

</style>
