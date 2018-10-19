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

<template lang='pug'>

b-form(@submit='onSave')
    span.invisible(@click='onSave', v-hotkey="['CTRL+ENTER', 'ctrl+s']", title='Save note')
    table.note-zone
        tr
            th Deck
            td
                list-selector(
                    taggable,
                    v-hotkey="['ctrl+d']",
                    title='Change deck'
                    v-model='internalValue.deck',
                    :disabled='deckFixed',
                    :optionsFunc='listDeck')

        tr
            th Model
            td
                list-selector(
                    :disabled='modelFixed',
                    v-hotkey="['ctrl+m']",
                    title='Change model',
                    v-model='internalValue.model',
                    :optionsFunc='listModel')
                quick-model-selector.mt-2(v-model='internalValue.model')

        template(v-for='(fFormat, index) in internalValue.fieldFormats', v-if='!fFormat.hidden')
            tr
                td.editor-row(colspan='2')
                    .mb-2.font-weight-bold {{fFormat.name}}
                    tui-summernote.editor-field(v-model='internalValue.fields[index]', :model-data='modelData', :card='internalValue')

        tr
            th Tags
            td
                tag-editor(v-model='internalValue.tags')
</template>

<script>

import ListSelector from '../common/ListSelector'
import Summernote from './Summernote/Summernote'
import TuiSummernote from './TuiSummernote'
import TagEditor from '../common/TagEditor'
import QuickModelSelector from './QuickModelSelector'
import nonReactiveCopy from '~/utils/nonReactiveCopy'
import _ from 'lodash'

import './editor.scss'
import { runHook } from '~/utils/hookBase'

import { listModel, getModel, listDeck } from '~/api'

function resize (arr, size, defval) {
  while (arr.length > size) { arr.pop() }
  while (arr.length < size) { arr.push(defval) }
}

export default {
  props: [
    'deckFixed',
    'modelFixed',
    'value'
  ],
  data () {
    return {
      internalValue: runHook('edit_card_load', _.clone(this.value))
    }
  },
  components: {
    Summernote,
    ListSelector,
    TagEditor,
    TuiSummernote,
    QuickModelSelector
  },
  methods: {
    onSave () {
      this.$el.querySelectorAll('.editor-field')[0].focus()
      this.$emit('save')
    },
    tagRenderer (tag) {
      if (tag === 'marked') {
        return {
          variant: 'danger',
          title: tag
        }
      }
    }
  },
  asyncComputed: {
    modelData: {
      get () {
        if (!this.currentModel) return {}
        return getModel(this.currentModel)
      },
      default: {}
    }
  },
  computed: {
    currentModel () {
      return this.internalValue.model
    },
    listModel: () => listModel,
    listDeck: () => listDeck
  },
  watch: {
    value: {
      handler (value) {
        this.internalValue = runHook('edit_card_load', nonReactiveCopy(value))
      },
      deep: true
    },
    internalValue: {
      handler (value) {
        const emitVal = runHook('edit_card_save', nonReactiveCopy(value))
        if (_.isEqual(emitVal, this.value)) return
        this.$emit('input', emitVal)
      },
      deep: true
    },
    async currentModel (modelName, oldModelName) {
      // Model change
      if (!modelName) {
        this.internalValue.model = oldModelName
        return
      }

      const model = await getModel(modelName)

      const fieldFormats = model.fieldFormats
      const newValue = nonReactiveCopy(this.internalValue)
      newValue.fieldFormats = fieldFormats
      resize(newValue.fields, fieldFormats.length, '')
      this.internalValue = runHook('edit_card_load', newValue)
    }
  }
}

</script>

<style lang='scss' scoped>

.note-zone {
    td, th {
        padding: .75em 0;
        &.editor-row {
            padding: .4em 0 .5em 0;
        }
    }
}
</style>
