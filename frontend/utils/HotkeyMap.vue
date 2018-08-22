<template lang="pug">
div
    b-modal(v-model='show', size='lg', hide-footer)
        span(slot='modal-title') Kian Cheatsheet
        ul
            li(v-for='kString in hotkeyList')
                key-image.kimg(:keys='kString')
                | {{hotkeyMap[kString]}}
    span(v-hotkey='"esc"', title='Show cheatsheet', @click='show = !show')
</template>

<script>

import { hotkeyMap } from './VueSimpleHotkey';
import KeyImage from './KeyImage';

export default {
    data () {
        return {
            hotkeyMap: {},
            show: false,
        };
    },
    components: {
        KeyImage,
    },
    watch: {
        show () {
            this.hotkeyMap = hotkeyMap;
        }
    },
    computed: {
        hotkeyList () {
            return Object.keys(this.hotkeyMap).sort();
        }
    }
};

</script>

<style lang="scss" scoped>

ul {
    list-style: none;
    columns: 3;
    padding: 0;
    li {
        .kimg {
            margin-right: 1em;
        }
    }
}

</style>
