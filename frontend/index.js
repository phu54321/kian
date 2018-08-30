// Copyright (C) 2018 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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

import Datepicker from 'vuejs-datepicker';
Vue.component('datepicker', Datepicker);

var VueCookie = require('vue-cookie');
Vue.use(VueCookie);

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

import 'typeface-noto-sans';

import './hook/allHooks';

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
