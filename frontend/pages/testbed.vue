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

    b-row
        b-col
            div(ref='mdEdit')
        b-col
            div.preview(v-html='html')

    pre(v-text='html')

</template>

<script>

import TuiEditor from 'tui-editor';

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.css';
import 'tui-editor/dist/tui-editor-contents.css';
import 'highlight.js/styles/github.css';

const initialMarkdown = `## DPLD의 일반론

- Sx: {{c1::운동시 dyspnea, 마른 기침}}  
- P/E: {{c2::Basal fine crackles _(부직포 뜯는 소리)_}}
- 폐기능검사
    - FVC: {{c3::≤70}}%
    - TLC: {{c7::≤70}}%
    - FEV1/FVc: {{c4::정상_/증가_}}
    - DLco: {{c5::감소 _(확산능 감소)_}}
- 폐기능장애: {{c6::제한::폐쇄/제한}}성`;


export default {
    data () {
        return {
            markdown: initialMarkdown,
            html: '',
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
            previewStyle: 'tab',
            height: 'auto',
        });
    },
    methods: {
        onChange () {
            this.markdown = this.editor.getValue();
            this.html = this.editor.getHtml();
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
