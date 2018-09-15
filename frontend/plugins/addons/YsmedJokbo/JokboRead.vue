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
        v-model='deck',
        apiType='deck_list')

    input.mt-2(type="file", @change="onFileChange")
    b-alert.mt-2(show)
        | {{message}}
        span(v-if='qaPair.length') ({{qaPair.length}} question found)

    div(v-if='qaPair.length')
        b-row.imgRow
            .toolbar
                b-btn.mr-1(size='sm', variant='primary', @click='acceptQAPair(0)', v-hotkey='"left"') Accept
                b-btn.mr-1(size='sm', variant='danger', @click='dismissQAPair(0)', v-hotkey='"right"') Dismiss
            b-col
                img.downscale(:src='qaPair[0].qUrl')
            b-col
                img.downscale(:src='qaPair[0].aUrl')

    browser-view(:cardIds='addedCardIds')


</template>


<script>

import Jimp from 'jimp';
import { parseQAPair } from './qaPairParser';
import ListSelector from '~/components//common/ListSelector';
import ankiCall from '~/api/ankiCall';
import { uploadImageFromDataURI } from '~/utils/uploadHelper';
import asyncData from '~/utils/asyncData';
import BrowserView from '~/components/browser/BrowserView';


export default {
    created () {
        document.addEventListener('paste', this.handlePaste);
    },
    destroyed () {
        document.removeEventListener('paste', this.handlePaste);
    },
    mounted () {
        const scriptEl = document.createElement('script');
        scriptEl.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.550/pdf.min.js');
        this.$refs.scriptHolder.appendChild(scriptEl);
        this.$nextTick(() => {
            this.PDFJS = window.pdfjsLib;
        });
    },
    data () {
        return {
            qaPair: [],
            message: 'Select a file.',
            deck: 'Default',
            addedCardIds: [],
            updateCardIds: 0,
            PDFJS: null,
        };
    },
    mixins: [asyncData(async () => {
        const createdCards = await ankiCall('browser_query', {
            query: '',
            sortBy: 'createdAt'
        });
        return {
            addedCardIds: createdCards.slice(0, 20)
        };
    })],
    watch: {
        async updateCardIds () {
            const createdCards = await ankiCall('browser_query', {
                query: '',
                sortBy: 'createdAt'
            });
            this.addedCardIds = createdCards.slice(0, 20);
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

            const URLObj = window.URL || window.webkitURL;
            const source = URLObj.createObjectURL(pdfFile);
            const pdf = await this.PDFJS.getDocument({ url: source });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            const promises = [];
            const pageNum = pdf.numPages;
            for(let pageIndex = 1 ; pageIndex <= pageNum ; pageIndex++) {  // TODO: fix this to 1
                const page = await pdf.getPage(pageIndex);
                const scale = 1.5;
                const viewport = page.getViewport(scale);

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                });
                promises.push(this.handleImage(canvas.toDataURL()));
                this.message = `Processing page ${pageIndex}/${pageNum}`;
            }
            this.message = 'Waiting for page extraction...';
            await Promise.all(promises);
            this.message = 'Done!';
        },

        async handleImage (url) {
            Jimp.read(url).then(img => {
                const qaPair = parseQAPair(img);
                qaPair.forEach(([q, a]) => {
                    Promise.all([
                        q.getBase64Async('image/jpeg'),
                        a.getBase64Async('image/jpeg')
                    ]).then(([qUrl, aUrl]) => {
                        this.qaPair.push({qUrl, aUrl});
                    });
                });
            });
        },

        async acceptQAPair (index) {
            let {qUrl: q, aUrl: a} = this.qaPair[index];
            this.qaPair.splice(index, 1);

            q = q.split('base64,')[1];
            a = a.split('base64,')[1];

            const [qUrl, aUrl] = await Promise.all([
                uploadImageFromDataURI('image.jpg', q),
                uploadImageFromDataURI('image.jpg', a),
            ]);

            await ankiCall('note_add', {
                deck: this.deck,
                model: 'Basic',
                fields: [
                    `<img src="${encodeURIComponent(qUrl)}">`,
                    `<img src="${encodeURIComponent(aUrl)}">`,
                ],
                tags: [],
            });
            this.updateCardIds++;
        },
        async dismissQAPair (index) {
            this.qaPair.splice(index, 1);
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