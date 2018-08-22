<template lang='pug'>
div
    template(v-for='pack in items')
        h5 {{pack[0]}}
        ul
            li(v-for='item in pack[1]')
                key-image.kimg(:keys='item[0]')
                | {{item[1]}}
</template>

<script>

import KeyImage from '../../../utils/KeyImage';

export default {
    components: {
        KeyImage
    },
    computed: {
        items: () => [
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
        ],
    }
};

</script>

<style lang="scss" scoped>

ul {
    list-style: none;
    columns: 2;
    padding: 0;
    li {
        .kimg {
            margin-right: 1em;
        }
    }
}

</style>
