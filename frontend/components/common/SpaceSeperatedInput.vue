<template lang="pug">
    autocomplete-box(:suggestions='autocompleteList', :bound-input='$refs.input')
        .item-input
            span.mr-2.item-existing(v-for='item in items', :key='item')
                b-badge(:variant='itemVariant(item)')
                    | {{item}}
                    span(@click='removeItemByName(item)')
                        icon.ml-1(name='times-circle', scale='.75')
            input.item-new(
                v-model='buildingItem',
                ref='input'
                @keydown='onKeyDown',
                @input='emitItem',
                :placeholder='placeholder'
                @blur='emitItem(true)')
        

</template>

<script>

import { KEY_MAP } from '../../utils/keycode';
import AutocompleteBox from './AutocompleteBox';

import $ from 'jquery';

export default {
    props: {
        value: Array,
        itemVariant: {
            type: Function,
            default: (c) => 'secondary',
        },
        isToken: {
            type: Function,
            default: (c) => true
        },
        suggestions: {
            type: Function,
            default: (c) => []
        },
        placeholder: {
            type: String,
            default: ''
        },
    },
    data () {
        return {
            items: this.value,
            buildingItem: '',
        };
    },
    components: {
        AutocompleteBox,
    },
    asyncComputed: {
        async autocompleteList() {
            return this.suggestions(this.buildingItem);
        }
    },
    methods: {
        onKeyDown (e) {
            if(e.keyCode == KEY_MAP['SPACE'] || e.keyCode == KEY_MAP['ENTER']) {
                const newTag = this.buildingItem.trim();
                if(newTag && this.items.indexOf(newTag) == -1) this.items.push(newTag);
                this.buildingItem = '';
                event.preventDefault();
            }
            else if(e.keyCode == KEY_MAP['BACKSPACE']) {
                const inputEl = $(this.$el).find('.item-new')[0];
                if(inputEl.selectionStart === 0 && inputEl.selectionEnd === 0) {
                    this.items.pop();
                }
            }
            this.emitItem();
        },
        removeItemByName (name) {
            const index = this.items.indexOf(name);
            if(index == -1) return;
            this.items.splice(index, 1);
            this.emitItem();
        },
        emitItem (force=false) {
            if(force === true || this.buildingItem.endsWith(' ')) {
                const newTag = this.buildingItem.trim();
                if(this.isToken(newTag)) {
                    if(newTag && this.items.indexOf(newTag) == -1) this.items.push(newTag);
                    this.buildingItem = '';
                }
            }

            const items = this.items.slice();
            const newTag = this.buildingItem.trim();
            if(newTag && items.indexOf(newTag) == -1) items.push(newTag);
            this.$emit('input', items);
        }
    },
    computed: {
        combinedTag () {
            const ret = this.items.slice();
            if(this.buildingItem) ret.push(this.buildingItem);
            return ret;
        },
    }
};
</script>

<style lang='scss' scoped>

.item-input {
    display: flex;
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
