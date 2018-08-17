<template lang="pug">
    div(v-html.once="value")
</template>
<script>

import $ from 'jquery';
import './cloze';
import './table';
import './disableUnwantedHotkeys';

export default {
    props : {
        value: {
            required: true
        },
    },
    watch: {
        value (val) {
            $(this.$el).summernote('code', val);
        }
    },
    mounted () {
        $(this.$el).summernote({
            prettifyHtml: true,
            autogrow: true,
            toolbar: [],
            codemirror: { // codemirror options
                theme: 'monokai',
                mode: 'text/html',
                htmlMode: true,
                lineNumbers: true
            },
            callbacks: {
                onChange: () => {
                    this.$emit('input', $(this.$el).summernote('code'));
                },
            }
        });
    },
    beforeDestroy () {
        $(this.$el).summernote('destroy');
    }
};

</script>

<style lang='scss'>

.note-editor {
    .note-editable {
        padding: 0 !important;
        img {
            max-width: 100%;
        }
    }

    // No resize bar
    .note-statusbar {
        display: none;
    }

    p {
        margin: 0 !important;
    }
}

.note-frame {
    border: none !important;
}


</style>