<template lang='pug'>
    table.table.table-sm
        tr
            th Keystroke
            th Action
        tr(v-for='item in items')
            td
                key-image(:keys='item.keystroke')
            td(v-html='item.action')
</template>

<script>

import KeyImage from './KeyImage';

export default {
    components: {
        KeyImage
    },
    data () {
        return {
            items: [
                { keystroke: 'Ctrl + Shift + C', action: 'Cloze w/ new number' },
                { keystroke: 'Ctrl + Shift + F', action: 'Cloze w/ same number' },
                { keystroke: 'Ctrl + Shift + D', action: 'Create table from selection<br><i>(a | b &lt;newline&gt; c | d format)</i>' },

            ]
        };
    }
};

</script>
