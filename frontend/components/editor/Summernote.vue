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
        window.xyz = $(this.$el).summernote({
            prettifyHtml: true,
            toolbar: [],
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