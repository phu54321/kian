<template lang='pug'>

.autocomplete-container
    slot
    .autocomplete-box(v-if='hasFocus && suggestions.length > 0')
        .autocomplete-entry(
            v-for='(item, index) in suggestions',
            :key='item',
            @mousedown='applyAutocomplete(index)',
            :class='{ selected: index == selected }') {{item}}

</template>

<script>
export default {
    props: {
        suggestions: {
            type: Array,
            default: () => [],
        },
    },
    mounted () {
        $(this.$el).on('keydown', 'input', (e) => {
            if(e.keyCode == 38) {  // Up arrow key
                this.selected = Math.max(0, this.selected - 1);
            } else if (e.keyCode == 40) {  // Down arrow key
                this.selected = Math.min(this.suggestions.length - 1, this.selected + 1);
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
    methods: {
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
        }
        
        .invisible {
            display: none;
        }
    }
}

</style>
