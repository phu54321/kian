import Vue from 'vue';

// Vuetify
import Vuetify from 'vuetify';
Vue.use(Vuetify);
import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

// Router
import VueRouter from 'vue-router';
import router from './router';
Vue.use(VueRouter);

// Axios
import axios from 'axios';
import VueAxios from 'vue-axios';

Vue.use(VueAxios, axios);


// Nprogress
import NProgress from 'vue-nprogress';
Vue.use(NProgress);
const nprogress = new NProgress({
    parent: '.nprogress-container'
});


// App
import App from './App';
new Vue({
    el: '#app',
    render: h => h(App),
    router,
    nprogress
});
