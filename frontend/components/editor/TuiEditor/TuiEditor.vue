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

    .codemirror-editor(ref='mdEdit')

    .preview
        .preview-body
            shadow-dom(:html='value')

</template>

<script>

import 'codemirror/lib/codemirror.css';
import CodeMirror from 'codemirror';
import 'codemirror/addon/edit/trailingspace';

import './addons/tui/fixOrderedListNumber';
import './addons/tui/overlay';
import './addons/tui/markdown';
import './addons/tui/gfm';
import './addons/tui/continuelist';
import './addons/tui/arrowKeyFunction';

import 'codemirror/keymap/sublime.js';
import extraKeys from './addons/extraKeys';

import './addons/cloze';
import './addons/textStyle';
import './addons/table';

import crc32 from 'crc-32';
import ankiCall from '~/api/ankiCall';
import ErrorDialog from '~/components/ErrorDialog';
import ShadowDom from '~/components/ShadowDom';
import markdownRenderer from './renderer/markdownRenderer';
import { getFileAsBase64, getRandomFilename } from '~/utils/uploadHelper';


const encoderDom = document.createElement('div');

function encodeMarkdown (markdown) {
    if(markdown === '') return '';

    let html = markdownRenderer(markdown);

    // Note: Browser may apply its specific escaping rules when HTML really gets into DOM.
    // ( for instance, browser may remove unmatched opening/closing tags without warning )
    // Since `decodeMarkdown` works on this 'escaped' html, we need to emulate the same
    // escaping process on this function for CRC32 to match.
    encoderDom.innerHTML = html;
    html = encoderDom.innerHTML;

    const htmlHash = crc32.str(html.trim());
    return `<script class='tui-md' type='text/markdown' hash='${htmlHash}'>${markdown}</sc` + `ript><div class='tui-html'>${html}</div>`;
}


function decodeMarkdown (html) {
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
    const htmlCRC = crc32.str(renderedHtml.trim());

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


export default {
    props: ['value'],

    isEditableHtml (html) {
        return decodeMarkdown(html) !== null;
    },

    encodeMarkdown,

    data () {
        return {
            cm: null,
            openPreview: false,
        };
    },

    components: {
        ShadowDom
    },

    mounted () {
        this.cm = CodeMirror(this.$refs.mdEdit, {
            mode: 'gfm',
            keyMap: 'sublime',
            value: this.markdown,
            lineNumbers: true,
            indentUnit: 4,
            lineWrapping: true,
            extraKeys,
        });

        // Image paste support. Code from tui.editor
        this.cm.on('paste', (cm, evData) => {
            const cbData = evData.clipboardData || window.clipboardData;
            const blobItems = cbData && cbData.items;
            const { types } = cbData;

            if (blobItems.length === 1 && types && types.length === 1 && [].slice.call(types).indexOf('Files') !== -1) {
                const item = blobItems[0];
                if (item.type.indexOf('image') !== -1) {
                    evData.preventDefault();
                    evData.stopPropagation();
                    evData.codemirrorIgnore = true;

                    const blob = item.name ? item : item.getAsFile(); // Blob or File
                    addImageBlobHook(blob, (fname) => {
                        this.cm.replaceSelection(`![](${fname})`);
                    });
                }
            }
        });
        this.cm.on('change', this.onChange);
        this.onChange();
    },

    computed: {
        markdown () {
            return decodeMarkdown(this.value) || '';
        },
        codemirrorShortcuts () {
            const sublimeKeymap = CodeMirror.keyMap.sublime;
            const fallthroughKeymap = CodeMirror.keyMap[sublimeKeymap.fallthrough];
            const keyMap = Object.assign({}, fallthroughKeymap, sublimeKeymap, extraKeys);

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
            const markdown = this.cm.getValue();
            const newMarkdown = decodeMarkdown(newHtml) || '';
            if(newMarkdown !== markdown) this.cm.setValue(newMarkdown);
        },
    },

    methods: {
        onChange () {
            const markdown = this.cm.getValue();
            this.$emit('input', encodeMarkdown(markdown));
        },
    },
};

</script>

<style scoped lang='scss'>

.tui-editor-container {
    .codemirror-editor {
        /deep/ .CodeMirror {
            font-family: 'D2Coding', 'Courier New', Courier, monospace;
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

            /deep/ img {
                max-width: 100%;
            }
        }
    }
}


</style>
