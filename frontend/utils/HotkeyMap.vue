<template lang="pug">
b-modal(id='cheatsheet', v-model='show', size='lg', hide-footer)
    span(slot='modal-title') Kian Cheatsheet
    template(v-for='pack in items')
        h5(v-if='pack[0]') {{pack[0]}}
        ul
            li(v-for='item in pack[1]')
                key-image.kimg(:keys='item[0]')
                | {{item[1]}}
</template>

<script>

import { hotkeyMap, hotkeyPack } from './VueSimpleHotkey';
import KeyImage from './KeyImage';

export default {
    data () {
        return {
            items: [],
            show: false,
        };
    },
    components: {
        KeyImage,
    },
    watch: {
        show () {
            const globalHotkeyList = (
                Object.keys(hotkeyMap).sort()
                    .map(kString => [kString, hotkeyMap[kString]])
            );
            const packHotkeyMap = {};
            Object.values(hotkeyPack).forEach(packs => {
                packs.forEach(pack => {
                    const [packName, packData] = pack;
                    if(!packHotkeyMap[packName]) packHotkeyMap[packName] = [];
                    packData.forEach(hotkey => packHotkeyMap[packName].push(hotkey));
                });
            });
            this.items = [
                [null, globalHotkeyList],
                ...Object.keys(packHotkeyMap).sort((a, b) => {
                    return a[0] < b[0] ? -1 :
                        a[0] == b[0] ? 0 : 1;
                }).map(packName => [packName, packHotkeyMap[packName]])
            ];
        }
    },
    computed: {
        hotkeyList () {
            return Object.keys(this.globalHotkeyMap).sort();
        }
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
