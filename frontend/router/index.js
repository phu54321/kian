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
            component: require('../components/Dashboard').default,
        },
        {
            path: '/deck/:deckName',
            component: require('../components/DeckOverview.vue').default,
            props: true,
        },

        {
            path: '/study/:deckName',
            component: require('../components/Reviewer.vue').default,
            props: true,
        },

        {
            path: '/edit/:noteId',
            component: require('../components/NoteEditor.vue').default,
            props: true,
            name: 'edit',
        },

        {
            path: '*',
            redirect: '/',
        },
    ],
});

router.afterEach(writeHistory);

export default router;
