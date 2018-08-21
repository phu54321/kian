import Vue from 'vue';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

import '@fortawesome/fontawesome-free/css/all.min.css';
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

import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
Vue.component('multiselect', Multiselect);

import VueObserveVisibility from 'vue-observe-visibility';
Vue.use(VueObserveVisibility);

import AsyncComputed from 'vue-async-computed';
import ErrorDialog from './components/ErrorDialog';

Vue.use(AsyncComputed, {
    useRawError: true,
    errorHandler (err) {
        ErrorDialog.openErrorDialog(err.msg, err.stack);
    }
});

import VueToasted from 'vue-toasted';
Vue.use(VueToasted, {
    iconPack : 'fontawesome',
    position: 'bottom-left', 
    duration : 2000
});

// App
import App from './App';
new Vue({
    el: '#app',
    render: h => h(App),
    router,
});
