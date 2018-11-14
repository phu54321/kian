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

  b-row
    b-col
      input.mt-2(type="file", @change="onFileChange")
    b-col.pt-1
      b.mr-2 Page range
      input.inp-range(v-model.number='minPage')
      | ~
      input.inp-range(v-model.number='maxPage')
      b-btn.float-right(size='sm', variant='primary', @click='scanPDF') Scan

  b-alert.mt-2(show)
    | {{message}}
    span.ml-2(v-if='qaPairList.length') ({{qaPairList.length}} question found)

  div(v-show='qaPairList.length')
    .toolbar(v-if='qaPairList.length')
      template(v-if='qSeperator.length === 0 && aSeperator.length === 0')
        b-btn.mr-1(size='sm', variant='primary', @click='acceptQAPair', v-hotkey='"left"') Accept
        b-btn.mr-1(size='sm', variant='danger', @click='dismissQAPair', v-hotkey='"right"') Dismiss
      b-btn.mr-1(size='sm', variant='info', @click='splitQAPair' v-hotkey='"space"' v-if='qSeperator.length === aSeperator.length && qSeperator.length > 0') Split
      | Current page: {{qaFirst.page}}
    b-progress.mt-1(height='5px', :value='currentPage - minPage', :max='maxPage - minPage')
    b-row.imgRow
      b-col
        .canvasContainer
          canvas.downscale.overlay(ref='qSeperatorCanvas', @click='toggleSeperatorQ')
          canvas.downscale(ref='qImgCanvas')

      b-col
        .canvasContainer
          canvas.downscale.overlay(ref='aSeperatorCanvas', @click='toggleSeperatorA')
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
import { Vue, Component, Watch } from 'vue-property-decorator'
import ImageView from '@/addons/YsmedJokbo/ImageView'

const URLObj = window.URL

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

function splitImage (img: Jimp, separatorYList: number[]) {
  let y0 = 0
  const imgs: Jimp[] = []
  const { width: imgW, height: imgH } = img.bitmap

  separatorYList = separatorYList.slice().sort()

  const view = new ImageView(img)

  for (const y1 of separatorYList) {
    imgs.push(view.crop(0, y0, imgW, y1 - y0).autocrop().toJimpWithPad(20))
    y0 = y1
  }
  imgs.push(view.crop(0, y0, imgW, imgH - y0).autocrop().toJimpWithPad(20))
  return imgs
}

@Component({
  components: {
    ListSelector,
    BrowserView
  }
})
export default class extends Vue {
  qaPairList: QAPair[] = []
  message = 'Select a file.'
  deck = 'Default'
  addedCardIds: number[] = []
  updateCardIds = 0

  minPage = 1
  maxPage = 1
  currentPage = 0
  pdf: any = null

  qSeperator: number[] = []
  aSeperator: number[] = []

  mounted () {
    const scriptEl = document.createElement('script')
    scriptEl.setAttribute('src', '/pdfjs/build/pdf.js')
    ;(this.$refs.scriptHolder as HTMLDivElement).appendChild(scriptEl)
  }

  beforeDestory () {
    if (this.pdf) {
      this.pdf.destroy()
      this.pdf = null
    }
  }

  async asyncData () {
    const createdCards = await queryCardIds()
    return {
      addedCardIds: createdCards.slice(0, 20)
    }
  }

  get qaFirst () { return this.qaPairList[0] }
  get listDeck () { return () => listDeck() }

  @Watch('updateCardIds')
  async onUpdateCardIdsUpdate () {
    const createdCards = await queryCardIds({
      query: '',
      sortBy: 'createdAt'
    })
    this.addedCardIds = createdCards.slice(0, 20)
  }

  @Watch('qaFirst')
  onQAFirstUpdate (v?: QAPair, oldv?: QAPair) {
    if (!v) return
    else if(v === oldv) return

    const { qImgData, aImgData } = v

    const qImgCanvas = this.$refs.qImgCanvas as HTMLCanvasElement
    const aImgCanvas = this.$refs.aImgCanvas as HTMLCanvasElement

    qImgCanvas.width = qImgData.width
    qImgCanvas.height = qImgData.height
    qImgCanvas.getContext('2d')!.putImageData(qImgData, 0, 0)

    aImgCanvas.width = aImgData.width
    aImgCanvas.height = aImgData.height
    aImgCanvas.getContext('2d')!.putImageData(aImgData, 0, 0)

    this.resetSeperator(qImgData, aImgData)
  }

  resetSeperator (qImgData: ImageData, aImgData: ImageData) {
    const qSeperatorCanvas = this.$refs.qSeperatorCanvas as HTMLCanvasElement
    const aSeperatorCanvas = this.$refs.aSeperatorCanvas as HTMLCanvasElement

    qSeperatorCanvas.width = qImgData.width
    qSeperatorCanvas.height = qImgData.height
    this.qSeperator = []

    aSeperatorCanvas.width = aImgData.width
    aSeperatorCanvas.height = aImgData.height
    this.aSeperator = []
  }

  toggleSeperatorQ (e: MouseEvent) {
    this.toggleSeperator(e, this.qSeperator)
  }

  toggleSeperatorA (e: MouseEvent) {
    this.toggleSeperator(e, this.aSeperator)
  }

  toggleSeperator (e: any, seperatorList: number[]) {
    const clickedY = (e.offsetY / e.target.offsetHeight * e.target.height) | 0
    for (let i = 0 ; i < seperatorList.length ; i++) {
      const y = seperatorList[i]
      if (Math.abs(y - clickedY) < 20) {
        seperatorList.splice(i, 1)
        return
      }
    }
    seperatorList.push(clickedY)
  }

  @Watch('qSeperator')
  qSeperatorChanged (v: number[]) {
    this.renderSeperatorCanvas(this.$refs.qSeperatorCanvas as HTMLCanvasElement, v)
  }

  @Watch('aSeperator')
  aSeperatorChanged (v: number[]) {
    this.renderSeperatorCanvas(this.$refs.aSeperatorCanvas as HTMLCanvasElement, v)
  }

  renderSeperatorCanvas (canvas: HTMLCanvasElement, seperatorList: number[]) {
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const y of seperatorList) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
  }

  splitQAPair () {
    const { qImgData, aImgData, page } = this.qaFirst
    const qJimp = new Jimp(qImgData)
    const aJimp = new Jimp(aImgData)

    const qs = splitImage(qJimp, this.qSeperator)
    const as = splitImage(aJimp, this.aSeperator)

    const newPairs = []
    for (let i = 0 ; i < qs.length ; i++) {
      newPairs.push({
        qImgData: imageDataFromJimp(qs[i]),
        aImgData: imageDataFromJimp(as[i]),
        page
      })
    }

    this.qaPairList.splice(0, 1, ...newPairs)
  }

  async onFileChange (e: Event) {
    const inputEl = e.target as HTMLInputElement
    const files = inputEl.files!
    if (!files.length) return

    const pdfFile = files[0]
    const source = URLObj.createObjectURL(pdfFile)
    const PDFJS = (window as any).pdfjsLib

    if (this.pdf) {
      this.pdf.destroy()
      this.pdf = null
    }
    this.pdf = await PDFJS.getDocument({ url: source })
    this.minPage = 1
    this.maxPage = this.pdf.numPages
  }

  async scanPDF () {
    const pdf = this.pdf
    if (!pdf) return this.$toasted.error('Select pdf')

    const startTime = new Date().getTime()
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!

    const pageNum = pdf.numPages
    for (let pageIndex = this.minPage; pageIndex <= this.maxPage; pageIndex++) {
      this.currentPage = pageIndex
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
  }

  handleImage (imageData: ImageData, page: number) {
    const qaPair = parseQAPair(new Jimp(imageData))
    qaPair.forEach(([q, a]) => {
      const qImgData = imageDataFromJimp(q)
      const aImgData = imageDataFromJimp(a)
      this.qaPairList.push({ qImgData, aImgData, page })
    })
  }

  async acceptQAPair () {
    const qImgCanvas = this.$refs.qImgCanvas as HTMLCanvasElement
    const aImgCanvas = this.$refs.aImgCanvas as HTMLCanvasElement

    const q = qImgCanvas.toDataURL('image/png').split('base64,')[1]
    const a = aImgCanvas.toDataURL('image/png').split('base64,')[1]
    const { page } = this.qaFirst

    this.qaPairList.splice(0, 1)

    const [qUrl, aUrl] = await Promise.all([
      uploadImageFromBase64('image.png', q),
      uploadImageFromBase64('image.png', a)
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
  }

  async dismissQAPair () {
    this.qaPairList.splice(0, 1)
  }
}
</script>

<style scoped lang='scss'>

.imgRow {
  border: 1px solid #ccc;
  margin: 1em 0;
  padding: .3em;
  position: relative;

  .canvasContainer {
    position: relative;
  }

  .downscale {
    max-width: 95%;
  }

  .overlay {
    position: absolute;
    top: 0;
  } 
}

.inp-range {
  width: 5em;
}

</style>
