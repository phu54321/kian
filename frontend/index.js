import Vue from 'vue';

// Bootstrap
import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon.vue';
Vue.component('icon', Icon);

// Router
import VueRouter from 'vue-router';
import router from './router';
Vue.use(VueRouter);

import VueSimpleHotkey from './utils/VueSimpleHotkey';
Vue.use(VueSimpleHotkey);

// Axios
import axios from 'axios';
import VueAxios from 'vue-axios';

Vue.use(VueAxios, axios);

// App
import App from './App';
new Vue({
    el: '#app',
    render: h => h(App),
    router,
});
