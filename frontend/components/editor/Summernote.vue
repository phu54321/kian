<template lang="pug">
    div(v-html="value")
</template>
<script>

import $ from 'jquery';
import './cloze';
import './table';

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
            autogrow: true,
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