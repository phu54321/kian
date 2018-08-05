<template lang="pug">
    div(v-html="value")
</template>
<script>

import $ from 'jquery';

import * as clozeBtns from './cloze.js';

export default {
    props : {
        value: {
            required: true
        },
        height: {
            type: String,
            default: '150'
        }
    },
    mounted () {
        $(this.$el).summernote({
            prettifyHtml: true,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph', 'table', 'link', 'picture']],
                ['misc', ['fullscreen', 'codeview', 'help', 'newClozeBtn', 'sameClozeBtn']]
            ],
            codemirror: { // codemirror options
                theme: 'monokai',
                mode: 'text/html',
                htmlMode: true,
                lineNumbers: true
            },
            buttons: {
                ...clozeBtns,
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