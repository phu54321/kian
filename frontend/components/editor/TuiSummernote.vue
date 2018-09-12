<template lang="pug">

tui-editor(v-if='isMarkdown', :value='value', @input='v => $emit("input", v)')
div(v-else)
    b-modal(ref='markdownConvertModal', title='Really convert?', lazy)
        b You might lose some of your formatting.
        p - To revert the changes, you should re-open the card editor.
        template(slot='modal-footer')
            b-btn(variant='danger', v-hotkey='"enter"', @click='convertToMarkdown') Convert
            b-btn(@click='$refs.markdownConvertModal.hide()') Cancel
    summernote(:value='value', @input='v => $emit("input", v)')
    b-btn.mt-2.float-right(variant='secondary', size='sm', @click='openMarkdownDialog') Convert to markdown

</template>

<script>

import TuiEditor from './TuiEditor/TuiEditor';
import Summernote from './Summernote/Summernote';
import TurndownService from 'turndown';

const turndownService = new TurndownService();
const gfm = require('turndown-plugin-gfm').gfm;
turndownService.use(gfm);

export default {
    props: ['value'],
    computed: {
        isMarkdown () {
            return TuiEditor.isEditableHtml(this.value);
        },
    },
    components: {
        TuiEditor,
        Summernote,
    },
    methods: {
        openMarkdownDialog () {
            this.$refs.markdownConvertModal.show();
        },
        convertToMarkdown () {
            const markdown = turndownService.turndown(this.value);
            const newHtml = TuiEditor.encodeMardownToEditableHtml(markdown);
            this.$emit('input', newHtml);
        }
    }
};

</script>
