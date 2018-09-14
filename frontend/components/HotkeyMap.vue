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
            ul.d-none.d-lg-block
                li(v-for='item in pack[1]')
                    key-image.kimg(:keys='item[0]')
                    .key-desc {{item[1]}}
            ul.d-lg-none
                li(v-for='item in pack[1]')
                    key-image.kimg(:keys='item[0]')
                    .key-desc {{item[1]}}
</template>

<script>

import { getHotkeyMap } from '../utils/hotkey/VueSimpleHotkey';
import KeyImage from './common/KeyImage';
import _ from 'lodash';

function sortObjectItemsByKey (obj) {
    const keys = Object.keys(obj);
    return keys.sort().map(k => [k, obj[k]]);
}

export default {
    data () {
        return {
            items: [],
            show: false,
            lastActiveElement: null,
            openHotkeyMapTimer: null,
        };
    },
    created () {
        window.addEventListener('keydown', this.detectLongCtrlPress_keydown, true);
        window.addEventListener('keyup', this.detectLongCtrlPress_keyup, true);
    },
    destroyed () {
        window.removeEventListener('keydown', this.detectLongCtrlPress_keydown);
        window.removeEventListener('keyup', this.detectLongCtrlPress_keyup);
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
        },
        detectLongCtrlPress_keydown (event) {
            if (event.keyCode === 17 && this.openHotkeyMapTimer === null) {  // Ctrl on Win/Linux, Cmd on macOS
                this.openHotkeyMapTimer = window.setTimeout(() => {
                    this.toggleShow();
                    window.clearTimeout(this.openHotkeyMapTimer);
                    this.openHotkeyMapTimer = null;
                }, 1300);
            }
        },
        detectLongCtrlPress_keyup (event) {
            if(event.keyCode === 17 && this.openHotkeyMapTimer) {
                window.clearTimeout(this.openHotkeyMapTimer);
                this.openHotkeyMapTimer = null;
            }
        },
    },
    watch: {
        show () {
            const hotkeyMap = getHotkeyMap(this.lastActiveElement);
            const hotkeyList = Object.keys(hotkeyMap).map(kString => Object.assign({kString}, hotkeyMap[kString]));
            const hotkeyGroup = _.groupBy(hotkeyList, 'packName');

            this.items = sortObjectItemsByKey(hotkeyGroup)
                .map(([group, handlers]) => [
                    group,
                    _.sortBy(handlers, 'kString')
                        .map(handler => [handler.kString, handler.title])
                ]);
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
    padding: 0;
    &.d-lg-none {
        columns: 2;
    }
    &.d-lg-block {
        columns: 3;
    }
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
