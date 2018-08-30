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

<template lang="pug">
div
    b-modal(id='cheatsheet', v-model='show', size='lg', hide-footer, :return-focus='lastActiveElement')
        span(slot='modal-title') Kian Cheatsheet
        template(v-for='(pack, index) in items')
            hr(v-if='index > 0')
            h5(v-if='pack[0]') {{pack[0]}}
            ul
                li(v-for='item in pack[1]')
                    key-image.kimg(:keys='item[0]')
                    .key-desc {{item[1]}}

    span(v-hotkey=['esc'], @click='toggleShow', title='Show cheatsheet')
</template>

<script>

import { hotkeyMap } from './VueSimpleHotkey';
import KeyImage from './KeyImage';

const hotkeyPack = {};

export default {
    addHotkeyPack (id, pack) {
        hotkeyPack[id] = pack;
    },
    removeHotkeyPack (id) {
        delete hotkeyPack[id];
    },
    data () {
        return {
            items: [],
            show: false,
            lastActiveElement: null,
        };
    },
    components: {
        KeyImage,
    },
    methods: {
        toggleShow () {
            // If there are any model visible, then quit.
            if(document.querySelectorAll('.modal.show').length > 0) return;
            this.lastActiveElement = document.activeElement;
            this.show = true;
        }
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
                ['Hotkeys', globalHotkeyList],
                ...Object.keys(packHotkeyMap).sort((a, b) => {
                    return a[0] < b[0] ? -1 :
                        a[0] === b[0] ? 0 : 1;
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
    columns: 3;
    padding: 0;
    li {
        position: relative;
        .kimg {
            position: absolute;
            margin-right: 1em;
        }
        .key-desc {
            margin-left: 6em;
        }
    }
}

</style>
