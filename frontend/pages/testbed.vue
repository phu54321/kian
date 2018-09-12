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
    h1.mb-4 Testbed

    | testwork

    div(ref='mdEdit')

    pre(v-text='html')

</template>

<script>

import TuiEditor from 'tui-editor';
import crc32 from 'crc-32';
import sanitizeHtml from 'sanitize-html';

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.css';
import 'tui-editor/dist/tui-editor-contents.css';
import 'highlight.js/styles/github.css';

const initialHtml = `<script class='tui-md' type='text/markdown' hash='538048892'>## DPLD의 일반론

- Sx: {{c1::운동시 dyspnea, 마른 기침}}  
- P/E: {{c2::Basal fine crackles _(부직포 뜯는 소리)_}}
- 폐기능검사
    - FVC: {{c3::≤70}}%
    - TLC: {{c7::≤70}}%
    - FEV1/FVc: {{c4::정상_/증가_}}
    - DLco: {{c5::감소 _(확산능 감소)_}}
- 폐기능장애: {{c6::제한::폐쇄/제한}}성</` + `script><div class='tui-html'><h2>DPLD의 일반론</h2>
<ul>
<li>Sx: {{c1::운동시 dyspnea, 마른 기침}}</li>
<li>P/E: {{c2::Basal fine crackles <em>(부직포 뜯는 소리)</em>}}</li>
<li>폐기능검사
<ul>
<li>FVC: {{c3::≤70}}%</li>
<li>TLC: {{c7::≤70}}%</li>
<li>FEV1/FVc: {{c4::정상_/증가_}}</li>
<li>DLco: {{c5::감소 <em>(확산능 감소)</em>}}</li>
</ul>
</li>
<li>폐기능장애: {{c6::제한::폐쇄/제한}}성</li>
</ul>
</div>`;


export default {
    data () {
        return {
            html: initialHtml,
            editor: null,
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
            previewStyle: 'vertical',
            height: 'auto',
            minHeight: '0',
        });
    },
    computed: {
        markdown () {
            if(!initialHtml) return '';

            const parser = new DOMParser();
            const domElement = parser.parseFromString(initialHtml, 'text/html');
            
            const markdownElements = domElement.getElementsByClassName('tui-md');
            if(markdownElements.length !== 1) return 'HTML not supported';
            const markdown = markdownElements[0].innerHTML;
            const expectedHtmlCRC = markdownElements[0].getAttribute('hash');

            const htmlElement = domElement.getElementsByClassName('tui-html');
            if(htmlElement.length !== 1) return 'HTML not supported';
            const html = htmlElement[0].innerHTML;
            const htmlCRC = crc32.str(html);
            if(htmlCRC.toString() !== expectedHtmlCRC) return 'CRC mismatch';

            return markdown;
        },
    },
    methods: {
        onChange () {
            const markdown = this.editor.getValue();
            const html = sanitizeHtml(this.editor.getHtml());
            const htmlHash = crc32.str(html);

            this.html = `<script class='tui-md' type='text/markdown' hash='${htmlHash}'>${markdown}</sc` + `ript><div class='tui-html'>${html}</div>`;
        },
    },
};

</script>

<style lang="scss" scoped>

/deep/ .te-tab {
    display: none !important;
}

.preview {
    border: 1px solid #ddd;
    padding: 1.5em;
}
</style>
