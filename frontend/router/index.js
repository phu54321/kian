import Vue from 'vue';
import Router from 'vue-router';
import {
    routerHistory,
    writeHistory
} from 'vue-router-back-button';

Vue.use(Router);
Vue.use(routerHistory);

const router = new Router({
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: require('../components/Dashboard').default,
        },
        {
            path: '/deck/:deckName',
            name: 'deck-overview',
            component: require('../components/DeckOverview.vue').default,
            props: true,
        },
        {
            path: '*',
            redirect: '/',
        },
    ],
});

router.afterEach(writeHistory);

export default router;
