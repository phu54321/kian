<template lang="pug">
    div(v-html.once="value")
</template>
<script>

import $ from 'jquery';
import { ankiCall } from '../../api/ankiCall';
import './cloze';
import './table';
import './disableUnwantedHotkeys';
import { getFileAsBase64 } from '../../utils/fileToBase64';


export default {
    props : {
        value: {
            required: true
        },
    },
    watch: {
        value (val) {
            const oldVal = $(this.$el).summernote('code');
            if(oldVal != val) {
                $(this.$el).summernote('code', val);
            }
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
                async onImageUpload (files) {
                    for(let i = 0 ; i < files.length ; i++) {
                        const file = files[i];
                        console.log(file);
                        const filename = file.name;
                        const datab64 = await getFileAsBase64(file);
                        const webFilename = await ankiCall('media_upload', {
                            filename,
                            datab64,
                        });
                        console.log(webFilename);
                        $(this).summernote("insertImage", webFilename);
                    }
                }
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