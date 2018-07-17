import Vue from 'vue';
import App from './App';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

Vue.use(Vuetify);

new Vue({
    el: '#app',
    render: h => h(App)
});