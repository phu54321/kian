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
    props: ['value'],

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
                if (this.svgCanvas) this.svgCanvas.setSvgString(this.internalValue);
            }
        },
    },

    mounted () {
        const iframeDOM = this.$refs.iframe;
        const iframeWindow = iframeDOM.contentWindow;

        iframeWindow.addEventListener('load', () => {
            const svgCanvas = new window.EmbeddedSVGEdit(iframeDOM);
            iframeWindow.addEventListener('keydown', eventPassThrough);
            iframeWindow.addEventListener('keyup', eventPassThrough);

            const iframeDocument = iframeWindow.document;
            iframeDocument.getElementById('main_button').style.display = 'none';
            iframeDocument.getElementById('tools_top').style.left = '0';

            svgCanvas.setSvgString(this.internalValue)(() => {
                svgCanvas.bind('changed', () => {
                    this.internalValue = svgCanvas.svgCanvasToString();
                    this.$emit('input', this.internalValue);
                });
            });
        }, { once: true });
    },
};


</script>
