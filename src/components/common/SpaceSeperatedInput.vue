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
autocomplete-box(:suggestions='autocompleteList', :renderer='renderer', @commit='applyAutocomplete')
    .item-input
        span.mr-2.item-existing(v-for='item in value', :key='item', @click='modifyItem(item)')
            colored-badge(:renderer='renderer', :item='item')
                span(@click.stop='removeItemByName(item)')
                    icon.ml-1(name='times-circle', scale='.75')

        input.item-new(
            v-model='buildingItem',
            ref='input'
            @keydown='onKeyDown',
            @input='emitItem',
            :placeholder='placeholder',
            @blur='emitItem(true)')

</template>

<script>

import AutocompleteBox from './AutocompleteBox'
import ColoredBadge from './ColoredBadge'
import { KEY_MAP } from '@/utils/keycode'
import { focusNextElement } from '@/utils/utils'

export default {
  props: {
    value: Array,
    validator: {
      type: Function,
      default: () => true
    },
    suggestions: {
      type: Function,
      default: () => []
    },
    renderer: {
      type: Function,
      default: () => undefined
    },
    placeholder: {
      type: String,
      default: ''
    },
    focus: Boolean
  },
  components: {
    AutocompleteBox,
    ColoredBadge
  },
  data () {
    return {
      buildingItem: ''
    }
  },
  mounted () {
    if (this.focus) {
      setTimeout(() => {
        this.$refs.input.focus()
        this.$refs.input.select()
      }, 1)
    }
  },
  asyncComputed: {
    autocompleteList: {
      async get () {
        if (this.buildingItem === '') return []
        else {
          return this.suggestions(this.buildingItem)
        }
      },
      default: []
    }
  },
  methods: {
    onKeyDown (e) {
      if (e.keyCode === KEY_MAP['BACKSPACE']) {
        const inputEl = this.$refs.input
        if (inputEl.selectionStart === 0 && inputEl.selectionEnd === 0) {
          const items = this.value.slice()
          items.pop()
          this.$emit('input', items)
        }
      } else if (e.keyCode === 13) { // enter
        if (this.buildingItem === '') {
          return focusNextElement()
        }
        this.emitItem(true)
      }
    },
    removeItemByName (name) {
      const items = this.value.slice()
      const index = items.indexOf(name)
      items.splice(index, 1)
      this.$emit('input', items)
    },
    modifyItem (item) {
      this.emitItem(true)

      const items = this.value.slice()
      const itemIdx = items.indexOf(item)
      items.splice(itemIdx, 1)
      this.$emit('input', items)

      this.buildingItem = item
      this.$refs.input.focus()
    },
    emitItem (force = false) {
      if (force === true || this.buildingItem.endsWith(' ')) {
        const newTag = this.buildingItem.trim()
        if (newTag && this.validator(newTag)) {
          if (newTag && this.value.indexOf(newTag) === -1) {
            this.$emit('input', [...this.value, newTag])
          }
          this.buildingItem = ''
        }
      }
    },
    applyAutocomplete (item) {
      this.buildingItem = item
      this.emitItem(true)
    }
  }
}
</script>

<style lang='scss' scoped>

.item-input {
    display: flex;
    flex-wrap: wrap;
    .item-existing {
        flex: 0;
        vertical-align: top;
    }
    .item-new {
        -webkit-appearance: none;
        -moz-appearance: none;

        font-size: .85em;
        padding-top: .25em;

        outline: none;
        border: none;
        box-shadow: none;
        flex: 1;
    }
}

</style>
