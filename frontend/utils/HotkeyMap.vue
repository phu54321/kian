<template lang="pug">
div
    b-modal(v-model='show', size='lg')
        span(slot='modal-title') Hotkey table
        div(v-for='kString in hotkeyList')
            | {{kString}} : {{hotkeyMap[kString]}}
    span(v-hotkey='"esc"', title='Show keymap', @click='show = !show')
</template>

<script>

import Vue from 'vue';
import { hotkeyMap } from './VueSimpleHotkey';

export default {
    data () {
        return {
            hotkeyMap: {},
            show: false,
        };
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
