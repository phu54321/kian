<template lang="pug">
    autocomplete-box(:suggestions='autocompleteList', :renderer='renderer', @commit='applyAutocomplete')
        .item-input
            span.mr-2.item-existing(v-for='item in value', :key='item')
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

import { KEY_MAP } from '../../utils/keycode';
import AutocompleteBox from './AutocompleteBox';

import $ from 'jquery';
import ColoredBadge from './ColoredBadge';

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
            default: () => undefined,
        },
        placeholder: {
            type: String,
            default: ''
        },
    },
    components: {
        AutocompleteBox,
        ColoredBadge,
    },
    data () {
        return {
            buildingItem: '',
        };
    },
    asyncComputed: {
        autocompleteList: {
            async get () {
                if(this.buildingItem == '') return [];
                else {
                    return this.suggestions(this.buildingItem);
                }
            },
            default: []
        },
    },
    methods: {
        onKeyDown (e) {
            if(e.keyCode == KEY_MAP['BACKSPACE']) {
                const inputEl = $(this.$el).find('.item-new')[0];
                if(inputEl.selectionStart === 0 && inputEl.selectionEnd === 0) {
                    const items = this.value.slice();
                    items.pop();
                    this.$emit('input', items);
                }
            }
        },
        removeItemByName (name) {
            const items = this.value.slice();
            const index = items.indexOf(name);
            items.splice(index, 1);
            this.$emit('input', items);
        },
        modifyItem (item) {
            this.emitItem(true);

            const items = this.value.slice();
            const itemIdx = items.indexOf(item);
            items.splice(itemIdx, 1);
            this.$emit('input', items);

            this.buildingItem = item;
            this.$refs.input.focus();
        },
        emitItem (force=false) {
            if(force === true || this.buildingItem.endsWith(' ')) {
                const newTag = this.buildingItem.trim();
                if(newTag && this.validator(newTag)) {
                    if(newTag && this.value.indexOf(newTag) == -1) {
                        this.$emit('input', [...this.value, newTag]);
                    }
                    this.buildingItem = '';
                }
            }
        },
        applyAutocomplete (item) {
            this.buildingItem = item;
            this.emitItem(true);
        }
    },
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
