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

autocomplete-box(:suggestions='autocompleteList', @commit='onAutocomplete')
    .dropdown-input
        input.form-control(ref='inputBox', :value='internalValue', :disabled='disabled',
            :placeholder='placeholder',
            @keydown='onKeyDown', @input='onInput', @keyup='onInput',
            @focus='onFocus(true)', @blur='onFocus(false)')
        .dropdown-indicator(:class='{enabled: focused}') ▼
</template>

<script>
import { fuzzyMatch, focusNextElement } from '@/utils/utils'
import AutocompleteBox from './AutocompleteBox'

export default {
  props: ['placeholder', 'value', 'optionsFunc', 'disabled', 'taggable', 'focus'],
  name: 'list-selector',
  components: {
    AutocompleteBox
  },

  data () {
    return {
      options: [this.value],
      internalValue: this.value,
      focused: false
    }
  },

  async asyncData (props) {
    const options = await props.optionsFunc()
    options.sort()
    return {
      options
    }
  },

  mounted () {
    if (this.focus !== undefined) {
      window.setTimeout(() => {
        this.$refs.inputBox.focus()
        this.$refs.inputBox.select()
      }, 1)
    }
  },

  computed: {
    autocompleteList () {
      return this.options.filter(option => fuzzyMatch(this.internalValue, option))
    }
  },

  methods: {
    isValidInput (v) {
      if (this.taggable !== undefined) return true
      else return this.options.indexOf(v) !== -1
    },
    onFocus (focused) {
      this.focused = focused
      if (focused) {
        this.$refs.inputBox.select()
      } else {
        if (!this.isValidInput(this.internalValue)) {
          this.internalValue = this.value
        }
      }
    },
    onInput () {
      this.internalValue = this.$refs.inputBox.value
    },
    onKeyDown (e) {
      if (e.keyCode === 27) { // ESC
        this.$refs.inputBox.blur()
        e.stopPropagation()
        e.preventDefault()
      } else if (e.keyCode === 13) {
        focusNextElement()
      }
    },
    onAutocomplete (val) {
      this.internalValue = val
      focusNextElement()
    }

  },

  watch: {
    value (v) {
      this.internalValue = v
    },
    internalValue (v) {
      if (this.isValidInput(v)) {
        this.$emit('input', v)
      }
    },
    options () {
      if (!this.value && this.options.length) {
        this.$emit('input', this.options[0]) // Select first option by default
      }
    }
  }
}
</script>

<style lang='scss' scoped>

.dropdown-input {
    position: relative;
    .dropdown-indicator {
        position: absolute;
        right: 10px;
        top: 8px;
        display: inline-block;
        &.enabled {
            transform: rotateX(180deg);
        }
        transition: .3s transform;
        transition-timing-function: ease-in-out;
    }
}

</style>
