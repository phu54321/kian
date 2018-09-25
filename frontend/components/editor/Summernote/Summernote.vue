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
    hotkey-pack(v-for='[packName, pack] in summernoteHotkeys', :pack='pack', :pack-name='packName', :depth='2', :key='packName')
    div(ref='noteDiv', v-html.once="value")
</template>

<script>

import $ from 'jquery';

import './cloze';
import './table';
import './htmledit';
import './disableUnwantedHotkeys';
import { getFileAsBase64, getRandomFilename } from '~/utils/uploadHelper';

const summernoteHotkeys = [
    ['Summernote - text styling', [
        ['CTRL+B', 'Bold'],
        ['CTRL+I', 'Italic'],
        ['CTRL+U', 'Underline'],
        ['CTRL+SHIFT+S', 'Strikethrough'],
        ['CTRL+K', 'Create link'],
        ['CTRL+BACKSPACE', 'Remove formatting'],
        ['Ctrl+Shift+C', 'Cloze w/ new number'],
        ['Ctrl+Shift+Alt+C', 'Cloze w/ same number'],
    ]],

    ['Summernote - html level editing', [
        ['Ctrl+Shift+D', 'Create table from selection'],
        ['CTRL+0', 'Convert to normal paragraph'],
        ['CTRL+1~6', 'Convert to headings (h1~h6)'],
        ['CTRL+]', 'Indent text'],
        ['CTRL+[', 'Outdent text'],
        ['CTRL+SHIFT+X', 'HTML edit'],
    ]],
];

export default {
    props : ['value', 'card', 'modelData'],
    watch: {
        value (val) {
            const oldVal = $(this.$refs.noteDiv).summernote('code');
            if (oldVal !== val) {
                $(this.$refs.noteDiv).summernote('code', val);
            }
        },
    },
    mounted () {
        const $noteDiv = $(this.$refs.noteDiv).summernote({
            prettifyHtml: true,
            autogrow: true,
            toolbar: [],
            disableLinkTarget: true,
            callbacks: {
                onChange: () => {
                    this.$emit('input', $(this.$refs.noteDiv).summernote('code'));
                },
                async onImageUpload (files) {
                    for (let i = 0 ; i < files.length ; i++) {
                        const file = files[i];
                        const filename = getRandomFilename(file.name);
                        const datab64 = await getFileAsBase64(file);
                        const webFilename = await this.$ankiCall('media_upload', {
                            filename,
                            datab64,
                        });
                        $(this).summernote('insertImage', webFilename);
                    }
                },
            },
        });

        $noteDiv.data('summernote').$vm = this;
    },
    computed: {
        summernoteHotkeys () {
            return summernoteHotkeys;
        },
    },
    beforeDestroy () {
        $(this.$refs.noteDiv).summernote('destroy');
    },
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
