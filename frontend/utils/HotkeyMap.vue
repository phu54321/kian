<template lang="pug">
div
    b-modal(v-model='show', size='lg', hide-footer)
        span(slot='modal-title') Hotkey table
        ul(v-for='kString in hotkeyList')
            li
                key-image(:keys='kString')
                | : {{hotkeyMap[kString]}}
    span(v-hotkey='"esc"', title='Show keymap', @click='show = !show')
</template>

<script>

import Vue from 'vue';
import { hotkeyMap } from './VueSimpleHotkey';
import KeyImage from '../components/editor/shortcut/KeyImage';

export default {
    data () {
        return {
            hotkeyMap: {},
            show: true,
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
            return Object.keys(this.hotkeyMap);
        }
    }
};

</script>
