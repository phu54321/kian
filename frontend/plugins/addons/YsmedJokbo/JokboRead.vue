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

    div(v-for='{qUrl, aUrl} in qaPair')
        b-row
            b-col
                img(:src='qUrl')
            b-col
                img(:src='aUrl')


</template>


<script>

import Jimp from 'jimp';
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
            qaPair: []
        };
    },
    methods: {
        handlePaste (event) {
            if (event.clipboardData) {
                var items = event.clipboardData.items;
                if (!items) return;
                
                //access data directly
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        //image
                        var blob = items[i].getAsFile();
                        var URLObj = window.URL || window.webkitURL;
                        var source = URLObj.createObjectURL(blob);
                        Jimp.read(source).then(img => {
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
                }
                event.preventDefault();
            }
        }
    },
};

</script>