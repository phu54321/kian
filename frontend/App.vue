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

<template lang='pug'>
div.app-body
    error-dialog
    sync-dialog
    hotkey-map

    header
        b-navbar(fixed='top', toggleable='sm', variant='primary', type='dark')
            b-container
                b-navbar-brand(href='#', to='/')
                    img.mr-1.logo(src='logo.svg')
                    | kian

                b-navbar-nav.ml-auto
                    b-nav-item(v-b-modal.cheatsheet, v-b-tooltip.hover, title='Show cheatsheet')
                        icon(name='regular/keyboard', scale='1.3')
                    b-nav-item(v-b-tooltip.hover, title='Sync now', v-b-modal.syncModal)
                        icon(name='sync')
                    b-nav-item.ml-3(v-hotkey='"H"', to='/decks', v-b-tooltip.hover, title='Home')
                        icon(name='home')
                    b-nav-item(v-hotkey='"A"', to='/card/add', v-b-tooltip.hover, title='Add card')
                        icon(name='plus')
                    b-nav-item(v-hotkey='"B"', to='/browse', v-b-tooltip.hover, title='Browse')
                        icon(name='search')
                    b-nav-item(to='/stats', v-b-tooltip.hover, title='Statistics')
                        icon(name='chart-bar')

    b-container.app-container
        router-view

    footer
        cookie-law(theme="base", message='Kian uses cookies to ensure you get the best experience on our website.')


</template>

<script>

import './css/kian.scss';
import ErrorDialog from './components/ErrorDialog';
import HotkeyMap from './utils/hotkey/HotkeyMap';
import CookieLaw from 'vue-cookie-law';
import SyncDialog from './components/SyncDialog';

export default {
    components: {
        ErrorDialog,
        HotkeyMap,
        CookieLaw,
        SyncDialog,
    },
    data () {
        return { msg: 'world' };
    }
};
</script>

<style scoped>

.logo {
    transform: translateY(-.1em);
    height: 1em;
}

.spacer {
    visibility: hidden;
}

</style>
