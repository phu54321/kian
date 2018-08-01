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
            component: require('../components/dashboard/Dashboard').default,
        },
        {
            path: '*',
            redirect: '/',
        },
    ],
});

router.afterEach(writeHistory);

export default router;
