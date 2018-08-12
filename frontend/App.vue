<template lang='pug'>
div
    error-dialog
    b-navbar(toggleable='sm', variant='primary', type='dark')
        b-container
            b-navbar-brand(href='#', to='/') Kian

            b-navbar-nav.ml-auto
                b-nav-item(to='/decks', v-b-tooltip.hover, title='Home')
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
