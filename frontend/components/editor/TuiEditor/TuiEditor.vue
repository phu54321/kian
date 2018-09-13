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
    // hotkey trap
    hotkey-pack(:depth='2', :pack='codemirrorShortcuts', pack-name='CodeMirror shortcuts')

    div.codemirror-editor(ref='mdEdit')

    .preview
        .preview-body
            shadow-dom(:html='value')

</template>

<script>

import 'codemirror/lib/codemirror.css';
import CodeMirror from 'codemirror';
import './codemirror-keymap';

// import './cloze';
// import './multiselect-styling';

import crc32 from 'crc-32';
import ankiCall from '~/api/ankiCall';
import ErrorDialog from '~/components/ErrorDialog';
import ShadowDom from '~/components/ShadowDom';
import markdownRenderer from './markdownRenderer';
import { getFileAsBase64, getRandomFilename } from '~/utils/uploadHelper';


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

function addImageBlobHook (blob, callback) {
    const filename = getRandomFilename(blob.name);

    getFileAsBase64(blob).then(datab64 => {
        return ankiCall('media_upload', {
            filename,
            datab64,
        });
    }).then(url => {
        callback(url);
    }).catch(e => {
        ErrorDialog.openErrorDialog('Image upload failed', e.message);
        callback('(upload error)');
    });
}

function camelCaseToSpacedText (str) {
    return str
        .replace(/[A-Z]/g, (s) => ` ${s.toLowerCase()}`)
        .replace(/[a-z]+/g, (s) => s.charAt(0).toUpperCase() + s.substr(1));
}

function encodeMardownToEditableHtml (markdown) {
    if(markdown === '') return '';

    const html = markdownRenderer(markdown);
    const htmlHash = crc32.str(html);
    return `<script class='tui-md' type='text/markdown' hash='${htmlHash}'>${markdown}</sc` + `ript><div class='tui-html'>${html}</div>`;
}


export default {
    props: ['value'],

    isEditableHtml (html) {
        return decodeHtml(html) !== null;
    },

    encodeMardownToEditableHtml,

    data () {
        return {
            editor: null,
            openPreview: false,
        };
    },

    components: {
        ShadowDom
    },

    mounted () {
        this.editor = CodeMirror(this.$refs.mdEdit, {
            value: this.markdown,
            mode: 'markdown',
            keyMap: 'sublime',
        });
        this.onChange();
    },

    computed: {
        markdown () {
            return decodeHtml(this.value) || '';
        },
        codemirrorShortcuts () {
            const sublimeKeymap = CodeMirror.keyMap.sublime;
            const fallthroughKeymap = CodeMirror.keyMap[sublimeKeymap.fallthrough];
            const keyMap = Object.assign({}, fallthroughKeymap, sublimeKeymap);

            return (
                Object.keys(keyMap)
                    .filter(k => ['fallthrough', 'esc'].indexOf(k.toLowerCase()) === -1)
                    .filter(k => k.indexOf(' ') === -1)  // Sequence shortcut is not supported by VueSimpleHotkey.
                    .map(k => [
                        k.replace(/-/g, '+').toLowerCase(),
                        camelCaseToSpacedText(keyMap[k]),
                    ])
            );
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
            // this.$emit('input', encodeMardownToEditableHtml(markdown));
        },
    },
};

</script>

<style scoped lang='scss'>

.tui-editor-container {
    .codemirror-editor {
        /deep/ .CodeMirror {
            font-family: 'D2Coding', 'Courier New', Courier, monospace;
            border: 3px solid #ddd;
            padding: .5em;
            height: auto;
        }    
    }

    .preview {
        width: 100%;
        z-index: 10;
        opacity: .9;
        pointer-events: none;

        .preview-body {
            padding: 1em;
            background-color: #f0fafe;
            border-left: 3px solid #81d4fa;

            img {
                max-width: 100%;
            }
        }
    }
}


</style>
