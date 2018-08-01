<template lang='pug'>
b-container
    nprogress-container
    b-navbar(toggleable='md', variant='primary', type='dark')
        b-navbar-toggle(target='nav_collapse')
        b-navbar-brand(href='#') Kian

        b-navbar-nav.ml-auto
            b-nav-item(to='/decks', v-b-tooltip.hover, title='Home')
                icon(name='home')
            b-nav-item(to='/browse', v-b-tooltip.hover, title='Browse')
                icon(name='search')
            b-nav-item(to='/stats', v-b-tooltip.hover, title='Statistics')
                icon(name='chart-bar')

    router-view
</template>

<script>

import NprogressContainer from 'vue-nprogress/src/NprogressContainer';

export default {
    components: {
        NprogressContainer
    },
    data () {
        return { msg: 'world' };
    }
};
</script>
