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
b-container.pt-4
    h1.mb-4 JokboReader

    div(ref='scriptHolder')

    list-selector(
        taggable,
        v-model='deck',
        :optionsFunc='listDeck')

    input.mt-2(type="file", @change="onFileChange")
    b-alert.mt-2(show)
        | {{message}}
        span.ml-2(v-if='qaPair.length') ({{qaPair.length}} question found)

    div(v-show='qaPair.length')
        b-row.imgRow
            .toolbar
                b-btn.mr-1(size='sm', variant='primary', @click='acceptQAPair', v-hotkey='"left"') Accept
                b-btn.mr-1(size='sm', variant='danger', @click='dismissQAPair', v-hotkey='"right"') Dismiss
                b-btn.mr-1(size='sm', variant='info', @click='splitQAPair',
                    v-if='qSeperator.length == aSeperator.length && qSeperator.length >= 1') Split
            b-col
                .imgCol
                    canvas.img(ref='qImgCanvas')
                    canvas(ref='qSeperatorCanvas', @click='toggleSeperatorQ')
            b-col
                .imgCol
                    canvas.img(ref='aImgCanvas')
                    canvas(ref='aSeperatorCanvas', @click='toggleSeperatorA')

    browser-view(:cardIds='addedCardIds', @updateCardIds='updateCardIds++')


</template>


<script>

import Jimp from 'jimp/es';
import ImageView from './ImageView';
import { parseQAPair } from './qaPairParser';
import ListSelector from '~/components//common/ListSelector';
import { uploadImageFromBase64 } from '~/utils/uploadHelper';
import BrowserView from '~/components/browser/BrowserView';
import { listDeck, findCards, addNote } from '~/api';

const URLObj = window.URL || window.webkitURL;

function imageDataFromJimp (img) {
    return new ImageData(
        new Uint8ClampedArray(img.bitmap.data),
        img.bitmap.width, img.bitmap.height
    );
}

function jimpFromCanvas (canvas) {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return new Jimp(imgData);
}

function splitImage (img, separatorYList) {
    let y0 = 0;
    const imgs = [];
    const { width: imgW, height: imgH } = img.bitmap;

    separatorYList = separatorYList.slice().sort();

    const view = new ImageView(img);

    for (const y1 of separatorYList) {
        imgs.push(view.crop(0, y0, imgW, y1 - y0).autocrop().toJimpWithPad(20));
        y0 = y1;
    }
    imgs.push(view.crop(0, y0, imgW, imgH - y0).autocrop().toJimpWithPad(20));
    return imgs;
}

export default {
    created () {
        document.addEventListener('paste', this.handlePaste);
    },
    destroyed () {
        document.removeEventListener('paste', this.handlePaste);
    },
    mounted () {
        const scriptEl = document.createElement('script');
        scriptEl.setAttribute('src', '/pdfjs/build/pdf.js');
        this.$refs.scriptHolder.appendChild(scriptEl);
    },
    data () {
        return {
            qaPair: [],
            message: 'Select a file.',
            deck: 'Default',
            addedCardIds: [],
            updateCardIds: 0,

            qSeperator: [],
            aSeperator: [],
        };
    },
    async asyncData () {
        const createdCards = await findCards();
        return {
            addedCardIds: createdCards.slice(0, 20),
        };
    },

    computed: {
        qaFirst () {
            return this.qaPair[0];
        },
        listDeck: () => listDeck,
    },
    watch: {
        async updateCardIds () {
            const createdCards = await findCards({
                query: '',
                sortBy: 'createdAt',
            });
            this.addedCardIds = createdCards.slice(0, 20);
        },
        qaFirst (v, oldv) {
            if (v === oldv) return;

            const [q, a] = v;

            const { qImgCanvas, aImgCanvas, qSeperatorCanvas, aSeperatorCanvas } = this.$refs;
            qImgCanvas.width = q.width;
            qImgCanvas.height = q.height;
            qImgCanvas.getContext('2d').putImageData(q, 0, 0);

            aImgCanvas.width = a.width;
            aImgCanvas.height = a.height;
            aImgCanvas.getContext('2d').putImageData(a, 0, 0);

            qSeperatorCanvas.width = q.width;
            qSeperatorCanvas.height = q.height;
            this.qSeperator = [];

            aSeperatorCanvas.width = a.width;
            aSeperatorCanvas.height = a.height;
            this.aSeperator = [];
        },

        qSeperator (v) {
            this.renderSeperatorCanvas(this.$refs.qSeperatorCanvas, v);
        },

        aSeperator (v) {
            this.renderSeperatorCanvas(this.$refs.aSeperatorCanvas, v);
        },
    },
    components: {
        ListSelector,
        BrowserView,
    },
    methods: {
        onFileChange (e) {
            const files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            this.handlePdf(files[0]);
        },
        async handlePdf (pdfFile) {
            this.message = `Processing ${pdfFile.name}...`;
            const source = URLObj.createObjectURL(pdfFile);
            const pdf = await window.PDFJS.getDocument({ url: source });

            try {
                const startTime = new Date().getTime();
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                const pageNum = pdf.numPages;
                for (let pageIndex = 1 ; pageIndex <= pageNum ; pageIndex++) {
                    const page = await pdf.getPage(pageIndex);
                    const scale = 1.5;
                    const viewport = page.getViewport(scale);

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                    });
                    this.message = `Processing page ${pageIndex}/${pageNum}`;
                    this.handleImage(jimpFromCanvas(canvas), pageIndex);
                }
                this.message = 'Waiting for page extraction...';
                this.message = `Done! (elapsed ${((new Date().getTime() - startTime) / 1000).toFixed(2)}s) `;
            } finally {
                pdf.destroy();
            }
        },

        handleImage (img, page) {
            const qaPair = parseQAPair(img);
            qaPair.forEach(([q, a]) => {
                const qImgData = imageDataFromJimp(q);
                const aImgData = imageDataFromJimp(a);
                this.qaPair.push([qImgData, aImgData, page]);
            });
        },

        async acceptQAPair () {
            const { qImgCanvas, aImgCanvas } = this.$refs;
            const q = qImgCanvas.toDataURL('image/jpeg').split('base64,')[1];
            const a = aImgCanvas.toDataURL('image/jpeg').split('base64,')[1];
            const page = this.qaFirst[2];

            this.qaPair.splice(0, 1);

            const [qUrl, aUrl] = await Promise.all([
                uploadImageFromBase64('image.jpg', q),
                uploadImageFromBase64('image.jpg', a),
            ]);

            await addNote({
                deck: this.deck,
                model: 'Basic',
                fields: [
                    `<img src="${encodeURIComponent(qUrl)}">`,
                    `<p><i>Page: ${page}</i></p><img src="${encodeURIComponent(aUrl)}">`,
                ],
                tags: [],
            });
            this.updateCardIds++;
        },
        async dismissQAPair () {
            this.qaPair.splice(0, 1);
        },

        // Seperator-related codes

        toggleSeperatorQ (e) {
            this.toggleSeperator(e, this.qSeperator);
        },

        toggleSeperatorA (e) {
            this.toggleSeperator(e, this.aSeperator);
        },

        toggleSeperator (e, seperatorList) {
            const clickedY = (e.offsetY / e.target.offsetHeight * e.target.height) | 0;
            for (let i = 0 ; i < seperatorList.length ; i++) {
                const y = seperatorList[i];
                if (Math.abs(y - clickedY) < 20) {
                    seperatorList.splice(i, 1);
                    return;
                }
            }
            seperatorList.push(clickedY);
        },

        splitQAPair () {
            const { qImgCanvas, aImgCanvas } = this.$refs;
            const qJimp = jimpFromCanvas(qImgCanvas);
            const aJimp = jimpFromCanvas(aImgCanvas);

            const qs = splitImage(qJimp, this.qSeperator);
            const as = splitImage(aJimp, this.aSeperator);
            const page = this.qaFirst[2];

            const newPairs = [];
            for (let i  = 0 ; i < qs.length ; i++) {
                newPairs.push([
                    imageDataFromJimp(qs[i]),
                    imageDataFromJimp(as[i]),
                    page,
                ]);
            }

            this.qaPair.splice(0, 1, ...newPairs);
        },

        renderSeperatorCanvas (canvas, seperatorList) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const y of seperatorList) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        },
    },
};

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

    .imgCol {
        position: relative;
        canvas {
            position: absolute;
            top: 0;
            left: 0;
            max-width: 95%;

            &.img {
                position: relative;
            }
        }
    }
}

</style>
