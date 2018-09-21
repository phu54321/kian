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
        apiType='deck_list')

    input.mt-2(type="file", @change="onFileChange")
    b-alert.mt-2(show)
        | {{message}}
        span.ml-2(v-if='qaPair.length') ({{qaPair.length}} question found)

    div(v-show='qaPair.length')
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


<script>

import Jimp from 'jimp';
import { parseQAPair } from './qaPairParser';
import ListSelector from '~/components//common/ListSelector';
import { uploadImageFromDataURI } from '~/utils/uploadHelper';
import BrowserView from '~/components/browser/BrowserView';

const URLObj = window.URL || window.webkitURL;

function imageDataFromJimp (img) {
    return new ImageData(
        new Uint8ClampedArray(img.bitmap.data),
        img.bitmap.width, img.bitmap.height
    );
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
        };
    },
    async asyncData () {
        const createdCards = await this.$ankiCall('browser_query', {
            query: '',
            sortBy: 'createdAt'
        });
        return {
            addedCardIds: createdCards.slice(0, 20)
        };
    },

    computed: {
        qaFirst () {
            return this.qaPair[0];
        },
    },
    watch: {
        async updateCardIds () {
            const createdCards = await this.$ankiCall('browser_query', {
                query: '',
                sortBy: 'createdAt'
            });
            this.addedCardIds = createdCards.slice(0, 20);
        },
        qaFirst (v) {
            const [q, a] = v;

            const { qImgCanvas, aImgCanvas } = this.$refs;
            qImgCanvas.width = q.width;
            qImgCanvas.height = q.height;
            qImgCanvas.getContext('2d').putImageData(q, 0, 0);

            aImgCanvas.width = a.width;
            aImgCanvas.height = a.height;
            aImgCanvas.getContext('2d').putImageData(a, 0, 0);
        }
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
                for(let pageIndex = 1 ; pageIndex <= pageNum ; pageIndex++) {
                    const page = await pdf.getPage(pageIndex);
                    const scale = 1.5;
                    const viewport = page.getViewport(scale);

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    });
                    this.message = `Processing page ${pageIndex}/${pageNum}`;
                    this.handleImage(context.getImageData(0, 0, canvas.width, canvas.height), pageIndex);
                }
                this.message = 'Waiting for page extraction...';
                this.message = `Done! (elapsed ${((new Date().getTime() - startTime) / 1000).toFixed(2)}s) `;
            } finally {
                pdf.destroy();
            }
        },

        handleImage (imageData, page) {
            const qaPair = parseQAPair(new Jimp(imageData));
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
                uploadImageFromDataURI('image.jpg', q),
                uploadImageFromDataURI('image.jpg', a),
            ]);

            await this.$ankiCall('note_add', {
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

    .downscale {
        max-width: 95%;
    }
}

</style>