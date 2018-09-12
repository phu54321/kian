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
    div(ref='mdEdit')

    .preview(v-if='value')
        .preview-header Preview
        .preview-body(v-html='value')

</template>

<script>

import TuiEditor from 'tui-editor';
import crc32 from 'crc-32';
import sanitizeHtml from 'sanitize-html';

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.css';
import 'tui-editor/dist/tui-editor-contents.css';
import 'highlight.js/styles/github.css';


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

export function isEditableHtml (html) {
    return decodeHtml(html) !== null;
}

export default {
    props: ['value'],

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
        });
    },
    computed: {
        markdown () {
            return decodeHtml(this.value) || '';
        },
    },
    watcher: {
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

/deep/ .te-tab {
    display: none !important;
}

.preview {
    margin-top: 1em;
    .preview-header {
        background-color: #777;
        color: #fff;
        padding: .1em .5em;
        font-weight: bold;
    }
    .preview-body {
        padding: 1em;
        background-color: #eee;
    }
}

</style>