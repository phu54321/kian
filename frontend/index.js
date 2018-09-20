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

import './api/ankiCall';

import './helpers/asyncData';
import './helpers/asyncComputed';
import './helpers/axios';
import './helpers/bootstrap-vue';
import './helpers/cookie';
import './helpers/datepicker';
import './helpers/fontawesome';
import './helpers/hotkey';
import './helpers/toasted';
import './helpers/vselect';
import './helpers/loadingOverlay';

import './addons/install';

import VueRouter from 'vue-router';
import Router from './router';
Vue.use(VueRouter);

window.onbeforeunload = function () {
    return 'Really refresh?';
};

// App
import App from './App';
new Vue({
    el: '#app',
    render: h => h(App),
    router: Router.createRouter(),
});
