<template lang='pug'>

.autocomplete-container
    slot
    .autocomplete-box(v-if='hasFocus && suggestions.length > 0')
        .autocomplete-entry(
            v-for='(item, index) in renderedSuggestions',
            :key='item.origValue',
            @mousedown='applyAutocomplete(index)',
            :class='{ selected: index == selected }')
            b-badge(:variant='item.variant') {{item.title}}
            span.origVal(v-if='item.title !== item.origValue') {{item.origValue}}

</template>

<script>

import $ from 'jquery';

export default {
    props: {
        suggestions: {
            type: Array,
            default: () => [],
        },
        renderer: {
            type: Function,
            default: c => undefined,
        }
    },
    mounted () {
        $(this.$el).on('keydown', 'input', (e) => {
            if(e.keyCode == 38) {  // Up arrow key
                this.selected = Math.max(0, this.selected - 1);
                e.preventDefault();
            } else if (e.keyCode == 40) {  // Down arrow key
                this.selected = Math.min(this.suggestions.length - 1, this.selected + 1);
                e.preventDefault();
            } else if (e.keyCode == 13) {
                if (this.selected !== -1) {
                    this.applyAutocomplete(this.selected);
                    e.stopPropagation();
                }
            }
        });

        $(this.$el).on('focus', 'input', (e) => {
            this.hasFocus = true;
        });

        $(this.$el).on('blur', 'input', (e) => {
            this.hasFocus = false;
        });
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
            if(this.selected === -1 || this.suggestions.length == 0) return;

            const $parentDiv = $(this.$el).find('.autocomplete-box');
            const $innerListItem = $($(this.$el).find('.autocomplete-entry')[this.selected]);

            $parentDiv.scrollTop(
                $parentDiv.scrollTop() + $innerListItem.position().top
                    - $parentDiv.height()/2 + $innerListItem.height()/2
            );
        }
    },
    computed: {
        renderedSuggestions () {
            return this.suggestions.map(this.renderItem);
        }
    },
    methods: {
        renderItem (item) {
            const ret = this.renderer(item) || {
                variant: 'secondary',
                title: item
            };
            ret.origValue = item;
            return ret;
        },
        applyAutocomplete (index) {
            this.$emit('commit', this.suggestions[index]);
            this.selected = -1;
        }
    }
}
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
        overflow-y: scroll;
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

        .invisible {
            display: none;
        }
    }
}

</style>
