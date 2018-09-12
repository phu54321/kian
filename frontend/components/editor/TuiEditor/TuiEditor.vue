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

.tui-editor-container
    div(ref='mdEdit')

    .preview
        .preview-body(v-html='value')

</template>

<script>

import TuiEditor from 'tui-editor';
import 'tui-editor/dist/tui-editor-extTable';
import 'tui-editor/dist/tui-editor-extColorSyntax';

import 'tui-editor/dist/tui-editor.css';
import 'tui-editor/dist/tui-editor-contents.css';
import 'tui-color-picker/dist/tui-color-picker.css';
import 'codemirror/lib/codemirror.css';
import 'highlight.js/styles/github.css';

import './codemirror-keymap';

import './keymap';
import './cloze';
import './multiselect-styling';

import crc32 from 'crc-32';


function decodeHtml (html) {
    if(!html) return '';

    const parser = new DOMParser();
    const domElement = parser.parseFromString(html, 'text/html');
    
    const markdownElements = domElement.getElementsByClassName('tui-md');
    if(markdownElements.length !== 1) return null;
    const markdown = markdownElements[0].innerHTML;
    const expectedHtmlCRC = markdownElements[0].getAttribute('hash');

    const htmlElement = domElement.getElementsByClassName('tui-html');
    if(htmlElement.length !== 1) return null;
    const renderedHtml = htmlElement[0].innerHTML;
    const htmlCRC = crc32.str(renderedHtml);
    if(htmlCRC.toString() !== expectedHtmlCRC) return null;

    return markdown;
}

export default {
    props: ['value'],

    isEditableHtml (html) {
        return decodeHtml(html) !== null;
    },

    data () {
        return {
            editor: null,
            openPreview: false,
        };
    },

    mounted () {
        this.editor = new TuiEditor({
            el: this.$refs.mdEdit,
            events: {
                change: this.onChange,
            },
            initialEditType: 'markdown',
            initialValue: this.markdown,
            previewStyle: 'tab',
            height: 'auto',
            minHeight: '0',
            exts: [
                'colorSyntax',

                'codemirror-keymap',

                'cloze',
                'multiselect-styling',
                'kian-keymap',
            ],
            hideModeSwitch: true,
        });
    },

    computed: {
        markdown () {
            return decodeHtml(this.value) || '';
        },
    },

    watch: {
        value (newHtml) {
            const markdown = this.editor.getValue();
            const newMarkdown = decodeHtml(newHtml) || '';
            if(newMarkdown !== markdown) this.editor.setValue(newMarkdown);
        },
    },

    methods: {
        onChange () {
            const markdown = this.editor.getValue();
            if(markdown === '') {
                return this.$emit('input', '');
            }

            const html = this.editor.getHtml();
            const htmlHash = crc32.str(html);

            this.$emit('input', `<script class='tui-md' type='text/markdown' hash='${htmlHash}'>${markdown}</sc` + `ript><div class='tui-html'>${html}</div>`);
        },
    },
};

</script>

<style scoped lang='scss'>

.tui-editor-container {
    /deep/ .te-tab {
        display: none !important;
    }

    .preview {
        width: 100%;
        z-index: 10;
        opacity: .9;
        pointer-events: none;

        .preview-body {
            padding: 1em;
            background-color: #EBF8FE;
            border-left: 3px solid #81d4fa;
        }
    }
}

/deep/ .CodeMirror {
    font-family: D2Coding, 'Courier New', Courier, monospace;
}

</style>
