<template lang='pug'>
div
    nprogress-container
    b-navbar(toggleable='md', variant='primary', type='dark')
        b-container
            b-navbar-toggle(target='nav_collapse')
            b-navbar-brand(href='#') Kian

            b-navbar-nav.ml-auto
                b-nav-item(to='/decks', v-b-tooltip.hover, title='Home')
                    icon(name='home')
                b-nav-item(to='/browse', v-b-tooltip.hover, title='Browse')
                    icon(name='search')
                b-nav-item(to='/stats', v-b-tooltip.hover, title='Statistics')
                    icon(name='chart-bar')

    b-container.mt-3
        router-view
</template>

<script>

import NprogressContainer from 'vue-nprogress/src/NprogressContainer';
import './css/sched.scss';

export default {
    components: {
        NprogressContainer
    },
    data () {
        return { msg: 'world' };
    }
};
</script>
