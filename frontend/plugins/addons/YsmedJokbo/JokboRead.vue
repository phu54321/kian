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

    input(type="file", @change="onFileChange")
    b-alert.mt-3(show) {{message}}

    div(v-for='({qUrl, aUrl}, index) in qaPair')
        b-row.imgRow
            .toolbar
                b-btn.mr-1(size='sm', variant='primary') Add
                b-btn.mr-1(size='sm', variant='danger') Pass
            b-col
                img.downscale(:src='qUrl')
            b-col
                img.downscale(:src='aUrl')


</template>


<script>

import Jimp from 'jimp';
import PDFJS from 'pdfjs-dist';
import { parseQAPair } from './qaPairParser';


export default {
    created () {
        document.addEventListener('paste', this.handlePaste);
    },
    destroyed () {
        document.removeEventListener('paste', this.handlePaste);
    },
    data () {
        return {
            qaPair: [],
            message: 'Select a file.',
        };
    },
    methods: {
        onFileChange (e) {
            const files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            this.handlePdf(files[0]);
        },
        async handlePdf (pdfFile) {
            const URLObj = window.URL || window.webkitURL;
            const source = URLObj.createObjectURL(pdfFile);
            const pdf = await PDFJS.getDocument({ url: source });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            const promises = [];
            const pageNum = pdf.numPages;
            for(let pageIndex = 1 ; pageIndex <= pageNum ; pageIndex++) {
                const page = await pdf.getPage(pageIndex);
                const scale = 2;
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
            this.message = `Waiting for page extraction...`;
            await Promise.all(promises);
            this.message = `Done!`;
        },

        async handleImage (url) {
            Jimp.read(url).then(img => {
                const qaPair = parseQAPair(img);
                qaPair.forEach(([q, a]) => {
                    Promise.all([
                        q.getBase64Async('image/png'),
                        a.getBase64Async('image/png')
                    ]).then(([qUrl, aUrl]) => {
                        this.qaPair.push({qUrl, aUrl});
                    });
                });
            });
        }
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