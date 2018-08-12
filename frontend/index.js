import Vue from 'vue';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon.vue';
Vue.component('icon', Icon);

import VueRouter from 'vue-router';
import router from './router';
Vue.use(VueRouter);

import VueSimpleHotkey from './utils/VueSimpleHotkey';
Vue.use(VueSimpleHotkey);

import axios from 'axios';
import VueAxios from 'vue-axios';
Vue.use(VueAxios, axios);

import vSelect from 'vue-select';
Vue.component('v-select', vSelect);

import VueVirtualScroller from 'vue-virtual-scroller';
Vue.use(VueVirtualScroller);

// App
import App from './App';
new Vue({
    el: '#app',
    render: h => h(App),
    router,
});
