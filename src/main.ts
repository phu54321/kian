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

import Vue from 'vue'

import './helpers/asyncData'
import './helpers/asyncComputed'
import './helpers/bootstrap-vue'
import './helpers/localStorage'
import './helpers/datepicker'
import './helpers/fontawesome'
import './helpers/hotkey'
import './helpers/toasted'
import './helpers/loadingOverlay'

import './helpers/addons/install'

import App from './App.vue'
import { createRouter } from './router'
import store from './store'

Vue.config.productionTip = false

createRouter().then(router => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}).catch(e => {
  alert('Unexpected error: Router initialization failed')
  console.error(e)
})
