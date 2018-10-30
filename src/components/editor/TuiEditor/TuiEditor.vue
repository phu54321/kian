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

.tui-editor-container(:class='{focused: focused}')
    // hotkey trap
    hotkey-pack(:depth='2', :pack='codeMirrorKeymap', pack-name='CodeMirror shortcuts')
    hotkey-pack(:depth='2', :pack='textStylingKeymap', pack-name='Text styling shortcuts')
    hotkey-pack(:depth='2', :pack='generalKeymap', pack-name='Text styling shortcuts')

    .codemirror-editor(ref='mdEdit')
    .preview(ref='preview')
        .preview-body
            .userContent.markdown-body(v-html='strippedHtml')
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/edit/trailingspace'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/show-hint.css'

import './addons/tui/fixOrderedListNumber'
import './addons/tui/overlay'
import './addons/tui/markdown'
import './addons/tui/gfm'
import './addons/kianGfm'
import './addons/tui/continuelist'
import './addons/tui/arrowKeyFunction'

import 'codemirror/keymap/sublime.js'
import extraKeys from './addons/extraKeys'

import './addons/cloze'
import './addons/textStyle'
import './addons/table'

import wautocompleter from './addons/wautocomplete'
import { KEY_MAP } from '@/utils/keycode'

import ErrorDialog from '@/components/ErrorDialog'
import MiniPaintModal from '@/components/minipaint/MiniPaintModal'
import encodeMarkdown, { replaceImageByIndex } from './renderer/markdownRenderer'
import decodeMarkdown from './decompiler/markdownDecompiler'
import { getFileAsBase64, uploadImageFromBase64 } from '@/utils/uploadHelper'

async function addImageBlobHook (blob) {
  const datab64 = await getFileAsBase64(blob)
  return uploadImageFromBase64(blob.name, datab64)
}

const codeMirrorKeymap = [
  ['alt+down', 'Move line down'],
  ['alt+up', 'Move line up'],
  ['shift+ctrl+d', 'Duplicate line'],
  ['ctrl+d', 'Select next occurrence'],
  ['alt+f3', 'Select all occurrences'],
  ['f9', 'Sort lines'],
  ['ctrl+j', 'Join lines'],
  ['alt+right', 'Indent list'],
  ['alt+left', 'Dedent list']
]

const textStylingKeymap = [
  ['ctrl+b', 'Bold'],
  ['ctrl+i', 'Italic'],
  ['ctrl+shift+s', 'Strikethrough'],
  ['ctrl+/', 'Comment'],
  ['ctrl+shift+c', 'Cloze (new number)'],
  ['ctrl+shift+f', 'Cloze (same number)'],
  ['ctrl+shift+r', 'Make table (power format pack)']
]

const generalKeymap = [
  ['ctrl+a', 'Select All'],
  ['ctrl+z', 'Undo'],
  ['ctrl+y', 'Redo']
]

export default {
  props: ['value', 'card', 'modelData'],

  isEditableHtml (html) {
    return decodeMarkdown(html) !== null
  },

  data () {
    return {
      cm: null,
      openPreview: false,
      focused: false
    }
  },

  mounted () {
    this.cm = CodeMirror(this.$refs.mdEdit, {
      mode: 'kian_gfm',
      keyMap: 'sublime',
      value: this.markdown,
      lineNumbers: true,
      indentUnit: 4,
      lineWrapping: true,
      extraKeys,
      hintOptions: {
        hint: wautocompleter,
        completeSingle: false
      }
    })

    this.cm.$vm = this
    this.cm.on('focus', () => { this.focused = true })
    this.cm.on('blur', () => { this.focused = false })

    // Image paste support. Code from tui.editor
    this.cm.on('paste', (cm, evData) => {
      const cbData = evData.clipboardData || window.clipboardData
      const blobItems = cbData && cbData.items
      const { types } = cbData

      if (
        blobItems.length === 1 &&
                types && types.length === 1 &&
                Array.prototype.slice.call(types).indexOf('Files') !== -1
      ) {
        const item = blobItems[0]
        if (item.type.indexOf('image') !== -1) {
          const loader = this.$loading.show()
          const oldSelections = this.cm.listSelections()
          this.cm.getInputField().blur()
          evData.preventDefault()
          evData.stopPropagation()
          evData.codemirrorIgnore = true

          const blob = item.name ? item : item.getAsFile() // Blob or File
          addImageBlobHook(blob).then((fname) => {
            loader.hide()
            this.cm.getInputField().focus()
            this.cm.setSelections(oldSelections)
            this.cm.replaceSelection(`![](${fname})`)
          }).catch(err => {
            this.$errorDialog('Image upload failed', err.message)
          })
        }
      }
    })
    this.cm.on('keyup', (cm, event) => {
      const ignoredKeycodes = [
        KEY_MAP['ENTER'],
        KEY_MAP['TAB'],
        KEY_MAP['ESC'],
        KEY_MAP['LEFT'],
        KEY_MAP['RIGHT'],
        KEY_MAP['UP'],
        KEY_MAP['DOWN']
      ]

      if (!cm.state.completionActive &&
                ignoredKeycodes.indexOf(event.keyCode) === -1
      ) {
        cm.showHint()
      }
    })
    this.cm.on('change', this.onChange)

    this.$refs.preview.addEventListener('click', this.onImageClick)
  },

  beforeDestroy () {
    this.$refs.preview.removeEventListener('click', this.onImageClick)
  },

  computed: {
    markdown () {
      return decodeMarkdown(this.value) || ''
    },
    strippedHtml () {
      if (this.value === '') return ''
      const parser = new DOMParser()
      const domElement = parser.parseFromString(this.value, 'text/html')
      return domElement.getElementsByClassName('tui-html')[0].innerHTML
    },
    codeMirrorKeymap: () => codeMirrorKeymap,
    textStylingKeymap: () => textStylingKeymap,
    generalKeymap: () => generalKeymap
  },

  watch: {
    value (newHtml) {
      const markdown = this.cm.getValue()
      const newMarkdown = decodeMarkdown(newHtml) || ''
      if (newMarkdown !== markdown) this.cm.setValue(newMarkdown)
    }
  },

  methods: {
    onChange () {
      const markdown = this.cm.getValue()
      this.$emit('input', encodeMarkdown(markdown))
    },

    onImageClick (e) {
      if (e.target.tagName === 'IMG') {
        const imgEl = e.target
        const imgUrl = imgEl.src
        const images = this.$refs.preview.getElementsByTagName('img')
        const imgIndex = Array.prototype.indexOf(images, e)
        if (!imgIndex === -1) {
          this.$toasted.error('Invalid image')
          return
        }

        MiniPaintModal.editImage(imgUrl)
          .then(newSrc => {
            const newMarkdown = replaceImageByIndex(this.markdown, imgIndex, newSrc)
            this.$emit('input', encodeMarkdown(newMarkdown))
          })
      }
    },

    onImageEdit (newSrc) {
      const newMarkdown = replaceImageByIndex(this.markdown, this.editingIndex, newSrc)
      this.editingUrl = null
      this.editingIndex = null
      this.$refs.imageEditModal.hide()
      this.$emit('input', encodeMarkdown(newMarkdown))
    }
  }
}
</script>

<style scoped lang='scss'>

.tui-editor-container {
    position: relative;
    .codemirror-editor {
        /deep/ .CodeMirror {
            font-family: 'D2Coding', 'Courier New', Courier, monospace;
            height: auto;
        }
    }

    .preview-body {
        padding: .5em 1em;
        background-color: #f0fafe;
        border-left: 3px solid #81d4fa;
        transition:
            .2s linear background-color,
            .2s linear border,
    }

    &.focused {
        .preview-body {
            padding: .5em 1em;
            background-color: #E8FCEB;
            border-left: 3px solid #99F9A9;
        }
    }
}

</style>
