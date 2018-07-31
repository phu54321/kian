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
            name: 'home',
            component: require('../components/Home').default,
        },
        {
            path: '*',
            redirect: '/',
        },
    ],
});


router.afterEach(writeHistory);

export default router;
