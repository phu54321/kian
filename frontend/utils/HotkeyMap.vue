<template lang="pug">
    b-modal(v-model='show')
        span(slot='modal-title') Hotkey map
        div(v-for='kString in hotkeyList')
            | {{kString}} : {{hotkeyMap[kString]}}

</template>

<script>

import Vue from 'vue';

const hotkeyMap = {};

export function addHotkeyMap(kString, title) {
    console.log(kString, title);
    hotkeyMap[kString] = title;
}

export function removeHotkeyMap(kString, title) {
    if (hotkeyMap[kString] === title) {
        hotkeyMap[kString] = undefined;
    }
}

export default {
    data () {
        return {
            hotkeyMap,
            show: true,
        };
    },
    computed: {
        hotkeyList () {
            return Object.keys(this.hotkeyMap)
                .filter(x => this.hotkeyMap[x] !== undefined);
        }
    }  
};

</script>
