<template lang='pug'>
div.app-body
    error-dialog
    hotkey-map

    header
        b-navbar(fixed='top', toggleable='sm', variant='primary', type='dark')
            b-container
                b-navbar-brand(href='#', to='/')
                    img.mr-1.logo(src='logo.svg')
                    | kian

                b-navbar-nav.ml-auto
                    b-nav-item(v-b-modal.cheatsheet, v-b-tooltip.hover, title='Show cheatsheet')
                        icon.mr-3(name='regular/keyboard', scale='1.3')
                    b-nav-item(v-hotkey='"H"', to='/decks', v-b-tooltip.hover, title='Home')
                        icon(name='home')
                    b-nav-item(v-hotkey='"A"', to='/note/add', v-b-tooltip.hover, title='Add card')
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
import HotkeyMap from './utils/HotkeyMap';
import CookieLaw from 'vue-cookie-law';

export default {
    components: {
        ErrorDialog,
        HotkeyMap,
        CookieLaw,
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
