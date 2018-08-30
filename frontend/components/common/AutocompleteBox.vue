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

.autocomplete-container
    slot
    .autocomplete-box(v-if='hasFocus && suggestions.length > 0')
        .autocomplete-entry(
            v-for='(item, index) in suggestions',
            :key='item',
            :class='{ selected: index === selected }',
            @mousedown='applyAutocomplete(index)',
        )
            colored-badge(:renderer='renderer', :item='item')
            span.origVal {{item}}

</template>

<script>

import $ from 'jquery';
import ColoredBadge from './ColoredBadge';
import HotkeyMap from '../../utils/hotkey/HotkeyMap';

const editorHotkeys = [
    ['Anki-related keys', [
        ['Ctrl + Shift + C', 'Cloze w/ new number'],
        ['Ctrl + Shift + F', 'Cloze w/ same number'],
    ]],

    ['Text editing', [
        ['CTRL+B', 'Bold'],
        ['CTRL+I', 'Italic'],
        ['CTRL+U', 'Underline'],
        ['CTRL+SHIFT+S', 'Strikethrough'],
        ['CTRL+K', 'Create link'],
        ['CTRL+BACKSLASH', 'Remove formatting'],
    ]],

    ['Paragraph-level editing', [
        ['Ctrl + Shift + D', 'Create table from selection'],
        ['CTRL+SHIFT+7', 'Insert unordered list'],
        ['CTRL+SHIFT+8', 'Insert ordered list'],
        ['CTRL+SHIFT+L', 'Justify to left'],
        ['CTRL+SHIFT+E', 'Justify to center'],
        ['CTRL+SHIFT+R', 'Justify to right'],
        ['CTRL+SHIFT+J', 'Justify to both sides (default)'],
    ]],

    ['Pan-paragraph level editing', [
        ['CTRL+0', 'Convert to normal paragraph'],
        ['CTRL+1~6', 'Convert to headings (h1~h6)'],
        ['CTRL+]', 'Indent text'],
        ['CTRL+[', 'Outdent text'],
    ]],
];

export default {
    props: {
        suggestions: {
            type: Array,
            default: () => [],
        },
        renderer: {
            type: Function,
            default: () => undefined,
        }
    },
    components: {
        ColoredBadge
    },
    mounted () {
        $(this.$el).on('keydown', 'input', (e) => {
            if(e.keyCode === 38) {  // Up arrow key
                this.selected = Math.max(0, this.selected - 1);
                e.preventDefault();
            } else if (e.keyCode === 40) {  // Down arrow key
                this.selected = Math.min(this.suggestions.length - 1, this.selected + 1);
                e.preventDefault();
            } else if (e.keyCode === 9) { // Tab
                if(this.suggestions.length > 0) {
                    if(this.selected === -1) this.applyAutocomplete(0);
                    else this.applyAutocomplete(this.selected);
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else if (e.keyCode === 13) {
                if (this.selected !== -1) {
                    this.applyAutocomplete(this.selected);
                    e.stopPropagation();
                }
            }
        });

        $(this.$el).on('focus', 'input', () => {
            this.hasFocus = true;
        });

        $(this.$el).on('blur', 'input', () => {
            this.hasFocus = false;
        });

        HotkeyMap.addHotkeyPack('editor', editorHotkeys);
    },
    beforeDestroy () {
        HotkeyMap.removeHotkeyPack('editor');
    },
    data () {
        return {
            selected: -1,
            hasFocus: false,
        };
    },
    watch: {
        suggestions () {
            this.selected = -1;
        },
        selected () {
            if(this.selected === -1 || this.suggestions.length === 0) return;

            const $parentDiv = $(this.$el).find('.autocomplete-box');
            const $innerListItem = $($(this.$el).find('.autocomplete-entry')[this.selected]);

            $parentDiv.scrollTop(
                $parentDiv.scrollTop() + $innerListItem.position().top
                    - $parentDiv.height()/2 + $innerListItem.height()/2
            );
        }
    },
    methods: {
        applyAutocomplete (index) {
            this.$emit('commit', this.suggestions[index]);
            this.selected = -1;
        }
    }
};

</script>

<style lang="scss" scoped>

.autocomplete-container {
    position: relative;
    .autocomplete-box {
        z-index: 9999;
        margin-top: .5em;
        position: absolute;
        width: 100%;
        max-height: 15em;
        overflow-y: auto;
        background-color: #fcfcfc;
        border: 1px solid #ddd;
        opacity: .9;

        .autocomplete-entry {
            padding: .2em .7em;
            &:hover {
                background-color: #eee;
            }

            &.selected {
                background-color: #e3ebff;
            }

            .origVal {
                float: right;
                font-style: italic;
                font-size: .9em;
                color: #555;
            }
        }
    }
}

</style>
