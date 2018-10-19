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

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import BootstrapVue from 'bootstrap-vue'

// Special helper for modal: click non-secondary button on enter.
import $ from 'jquery'
import '~/utils/hotkey/jquery.hotkeys'
Vue.use(BootstrapVue)

$(document).bind('keydown', 'enter', () => {
  const modalDialogs = document.querySelectorAll('.modal.show')
  if (modalDialogs.length === 1) {
    const buttons = modalDialogs[0].querySelectorAll('.modal-footer .btn:not(.btn-secondary)')
    if (buttons.length === 1) {
      buttons[0].click()
    }
  }
})
