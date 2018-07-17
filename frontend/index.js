import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import router from './router';

Vue.use(Vuetify);
Vue.use(VueRouter);

new Vue({
    el: '#app',
    render: h => h(App),
    router
});