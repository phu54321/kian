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
            @input='onInput', @keyup='onInput',
            @focus='isFocused = true', @blur='isFocused = false')
        .dropdown-indicator(:class='{enabled: isFocused}') ▼
</template>

<script>
import asyncData from '~/utils/asyncData';
import ankiCall from '~/api/ankiCall';
import { fuzzyMatch } from '~/utils/utils';
import AutocompleteBox from './AutocompleteBox';

export default {
    props: ['placeholder', 'value', 'apiType', 'disabled', 'taggable', 'focused'],
    name: 'list-selector',
    components: {
        AutocompleteBox,
    },

    data () {
        return {
            options: [this.value],
            internalValue: this.value,
            isFocused: false,
        };
    },

    mixins: [asyncData(async props => {
        const options = await ankiCall(props.apiType);
        options.sort();
        return {
            options
        };
    })],

    mounted () {
        if(this.focused !== undefined) {
            this.$refs.inputBox.focus();
        }
        if(!this.value && this.options.length) {
            this.$emit('input', this.options[0]); // Select first option by default
        }
    },

    computed: {
        autocompleteList () {
            return this.options.filter(option => fuzzyMatch(this.internalValue, option));
        }
    },

    methods: {
        isValidInput (v) {
            if(this.taggable) return true;
            else return this.options.indexOf(v) !== -1;
        },
        onInput () {
            this.internalValue = this.$refs.inputBox.value;
        },
        onAutocomplete (val) {
            this.internalValue = val;
        },

    },

    watch: {
        value (v) {
            this.internalValue = v;
        },
        internalValue (v) {
            if (this.isValidInput(v)) {
                this.$emit('input', v);
            }
        },
        options () {
            if(!this.value && this.options.length) {
                this.$emit('input', this.options[0]); // Select first option by default
            }   
        }
    }
};

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