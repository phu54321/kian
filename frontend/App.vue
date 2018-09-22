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
        b-navbar(toggleable='sm', variant='dark', type='dark')
            b-container
                b-navbar-brand(href='#', to='/')
                    img.mr-1.logo(src='logo.svg')
                    | kian

                b-navbar-toggle(target="nav_collapse")

                b-collapse(is-nav, id="nav_collapse")
                    b-navbar-nav.ml-auto
                        // Plugin-customizable toolbar
                        b-nav-item(v-for='item in toolbarList', :key='item.title', :to='item.to', v-b-tooltip.hover, :title='item.title')
                            icon(:name='item.icon')
                            span.d-sm-none.ml-2 {{item.title}}
                        b-nav-text.ml-3(v-if='toolbarList')

                        // Default Kian toolbar
                        b-nav-item(v-b-modal.cheatsheet, v-b-tooltip.hover, title='Show cheatsheet (Ctrl/Cmd)')
                            icon(name='regular/keyboard', scale='1.3')
                            span.d-sm-none.ml-2 Show cheatsheet
                        b-nav-item(v-b-tooltip.hover, title='Sync now', v-b-modal.syncModal)
                            icon(name='sync')
                            span.d-sm-none.ml-2 Sync now
                        b-nav-text.ml-3

                        b-nav-item(v-hotkey='"H"', pack-name='Menu', to='/decks', v-b-tooltip.hover, title='Home')
                            icon(name='home')
                            span.d-sm-none.ml-2 Home
                        b-nav-item(v-hotkey='"A"', pack-name='Menu', to='/card/add', v-b-tooltip.hover, title='Add card')
                            icon(name='plus')
                            span.d-sm-none.ml-2 Add cards
                        b-nav-item(v-hotkey='"B"', pack-name='Menu', to='/browse', v-b-tooltip.hover, title='Browse')
                            icon(name='search')
                            span.d-sm-none.ml-2 Browser cards
                        b-nav-item(to='/stats', v-b-tooltip.hover, title='Statistics')
                            icon(name='chart-bar')
                            span.d-sm-none.ml-2 Statistics

    b-container.app-container
        router-view

    footer
        cookie-law(theme="base", message='Kian uses localStorage to store various preferences and serve you the best experience on our website.')


</template>

<script>

import ErrorDialog from './components/ErrorDialog';
import HotkeyMap from './components/HotkeyMap';
import CookieLaw from 'vue-cookie-law';
import SyncDialog from './components/SyncDialog';

import './css/kian.scss';

import MainToolbar from './toolbar';

import { mapActions } from 'vuex';

export default {
    components: {
        ErrorDialog,
        HotkeyMap,
        CookieLaw,
        SyncDialog,
    },

    created () {
        this.loadUserConfig();
    },

    methods: {
        ...mapActions([
            'loadUserConfig',
        ]),
    },

    computed: {
        toolbarList: () => MainToolbar.list(),
    },
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
