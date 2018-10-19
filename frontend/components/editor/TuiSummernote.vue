<template lang="pug">

tui-editor(v-if='isMarkdown', @input='v => $emit("input", v)', v-bind='$props')
div(v-else)
    b-modal(ref='markdownConvertModal', title='Really convert?', lazy)
        b You might lose some of your formatting.
        p - To revert the changes, you should re-open the card editor.
        template(slot='modal-footer')
            b-btn(variant='danger', v-hotkey='"enter"', @click='convertToMarkdown') Convert
            b-btn(@click='$refs.markdownConvertModal.hide()') Cancel
    summernote(@input='v => $emit("input", v)', v-bind='$props')
    b-btn.mt-2.float-right(v-hotkey=['ctrl+shift+m'], variant='secondary', size='sm', @click='openMarkdownDialog') Convert to markdown

</template>

<script>

import TuiEditor from './TuiEditor/TuiEditor'
import Summernote from './Summernote/Summernote'
import encodeMarkdown from './TuiEditor/renderer/markdownRenderer'
import { turndown } from './TuiEditor/decompiler/markdownDecompiler'

export default {
  props: ['value', 'card', 'modelData'],
  computed: {
    isMarkdown () {
      return TuiEditor.isEditableHtml(this.value)
    }
  },
  components: {
    TuiEditor,
    Summernote
  },
  methods: {
    openMarkdownDialog () {
      this.$refs.markdownConvertModal.show()
    },
    convertToMarkdown () {
      const markdown = turndown(this.value)
      const newHtml = encodeMarkdown(markdown)
      this.$refs.markdownConvertModal.hide()
      this.$emit('input', newHtml)
    }
  }
}

</script>
