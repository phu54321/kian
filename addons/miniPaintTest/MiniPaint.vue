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

// function eventPassThrough (e) {
//     const newEvent = new e.constructor(e.type, e);
//     document.body.dispatchEvent(newEvent);
// }

function domOnloadPromise (win) {
    return new Promise((resolve) => {
        win.addEventListener('load', resolve);
    });
}

function imgOnloadPromise (imgEl) {
    return new Promise((resolve) => {
        imgEl.onload = resolve;
    });
}

function sleep (duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}

export default {
    // props: ['initialUrl'],

    data () {
        return {
            iframeWindow: null,
            internalValue: this.value,
            initialUrl: '/favicon.png',
        };
    },

    async mounted () {
        await this.$nextTick();

        const iframeDOM = this.$refs.iframe;
        const iframeWindow = this.iframeWindow = iframeDOM.contentWindow;

        const imgEl = document.createElement('img');
        imgEl.src = this.initialUrl;

        await Promise.all([
            domOnloadPromise(iframeWindow),
            imgOnloadPromise(imgEl),
        ]);

        // miniPaint has its own onload handler, but it is registered after domOnloadPromise
        // is registered. (mounted called before iframe rendering). Let that handler run first.
        while (!iframeWindow.Layers) await sleep(1);

        const newLayer = {
            name: 'Image',
            type: 'image',
            data: imgEl,
            width: imgEl.naturalWidth || imgEl.width,
            height: imgEl.naturalHeight || imgEl.height,
            width_original: imgEl.naturalWidth || imgEl.width,
            height_original: imgEl.naturalHeight || imgEl.height,
        };

        iframeWindow.Layers.insert(newLayer);
    },
};


</script>

<style scoped lang='scss'>

iframe {
    border: none;
}

</style>
