<template lang='pug'>
div.app-container
    error-dialog
    b-navbar(fixed='top', toggleable='sm', variant='primary', type='dark')
        b-container
            b-navbar-brand(href='#', to='/')
                img.mr-2.logo(src='logo.svg')
                | Kian

            b-navbar-nav.ml-auto
                b-nav-item(v-hotkey='"H"', to='/decks', v-b-tooltip.hover, title='Home')
                    icon(name='home')
                b-nav-item(v-hotkey='"A"', to='/note/add', v-b-tooltip.hover, title='Add')
                    icon(name='plus')
                b-nav-item(v-hotkey='"B"', to='/browse', v-b-tooltip.hover, title='Browse')
                    icon(name='search')
                b-nav-item(to='/stats', v-b-tooltip.hover, title='Statistics')
                    icon(name='chart-bar')

    b-container.mt-3
        router-view
</template>

<script>

import './css/kian.scss';
import ErrorDialog from './components/ErrorDialog';

export default {
    components: {
        ErrorDialog,
    },
    data () {
        return { msg: 'world' };
    }
};
</script>

<style>

.logo {
    transform: translateY(-.1em);
    height: 1em;
}

</style>
