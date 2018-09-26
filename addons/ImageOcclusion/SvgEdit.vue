<template lang='pug'>

iframe(ref='iframe', src='/imgocld/svgedit/svg-editor.html', width='100%', height='100%')

</template>

<script>

import './svgedit/embedapi';

function eventPassThrough (e) {
    const newEvent = new e.constructor(e.type, e);
    document.body.dispatchEvent(newEvent);
}

export default {
    props: ['value', 'backgroundImageUrl'],

    data () {
        return {
            svgCanvas: null,
            internalValue: this.value,
        };
    },

    watch: {
        value (v) {
            if (this.internalValue !== v) {
                this.internalValue = v;
                if (this.svgCanvas) this.setContent(v);
            }
        },
        backgroundImageUrl (url) {
            if (this.svgCanvas) this.setBackgroundImage(url);
        },
    },

    mounted () {
        const iframeDOM = this.$refs.iframe;
        const iframeWindow = iframeDOM.contentWindow;

        iframeWindow.addEventListener('keydown', eventPassThrough);
        iframeWindow.addEventListener('keyup', eventPassThrough);

        iframeWindow.addEventListener('load', async () => {
            const iframeDocument = iframeWindow.document;
            iframeDocument.getElementById('main_button').style.display = 'none';
            iframeDocument.getElementById('tools_top').style.left = '0';

            const svgCanvas = new window.EmbeddedSVGEdit(iframeDOM);
            this.svgCanvas = svgCanvas;

            if (this.backgroundImageUrl) await this.setBackgroundImage(this.backgroundImageUrl);
            if (this.internalValue) await this.setContent(this.internalValue);

            svgCanvas.bind('changed', () => {
                this.internalValue = svgCanvas.svgCanvasreToString();
                this.$emit('input', this.internalValue);
            });
        }, { once: true });
    },

    methods: {
        setContent (svg) {
            return new Promise((resolve) => {
                const { svgCanvas } = this;
                svgCanvas.setSvgString(svg)(resolve);
            });
        },

        setBackgroundImage (url) {
            return new Promise((resolve) => {
                const { svgCanvas } = this;
                svgCanvas.setBackground('#fff', url)(() => {
                    const bgImage = this.$refs.iframe.contentWindow.svgedit.utilities.getElem('background_image');
                    const bgImageUrl = bgImage.getAttribute('xlink:href');
                    const img = new Image();
                    img.onload = () => {
                        const { width, height } = img;
                        svgCanvas.setResolution(width, height)(resolve);
                    };
                    img.src = bgImageUrl;
                });
            });
        },
    },
};


</script>
