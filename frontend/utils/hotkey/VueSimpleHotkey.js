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

import $ from 'jquery';
import './jquery.hotkeys';
import { clickVNode } from './clickElement';

export const hotkeyMap = {};

function addHotkeyMap (kString, title) {
    hotkeyMap[kString] = title;
}

function removeHotkeyMap (kString, title) {
    if (hotkeyMap[kString] === title) {
        delete hotkeyMap[kString];
    }
}


function registerHotkey (el, binding, vnode) {
    if (el._onKeyDown) unregisterHotkey(el);

    let hotkeyList = binding.value;
    if (typeof hotkeyList === 'string') hotkeyList = [hotkeyList];
    const hotkeyString = hotkeyList.map(x => x.toLowerCase());
    const attrs = vnode.data.attrs;
    const title = (attrs.title) ? attrs.title : $(el).text();

    function onKeyDown (e) {
        clickVNode(vnode);
        e.stopPropagation();
        e.preventDefault();
    }

    el._onKeyDown = onKeyDown;
    el._hotKeyInputWhitelist = [];
    el._title = title;
    el._kStringList = hotkeyString;
    hotkeyString.forEach(kString => {
        $(document).bind('keydown', kString, el._onKeyDown);
        addHotkeyMap(kString, title);
        if(kString === 'esc' || kString.indexOf('ctrl') !== -1 || kString.indexOf('alt') !== -1) {
            $.hotkeyInputWhitelist[kString] = true;
            el._hotKeyInputWhitelist.push(kString);
        }
    });
}

function unregisterHotkey (el) {
    if (el._onKeyDown) {
        $(document).unbind('keydown', el._onKeyDown);
        el._hotKeyInputWhitelist.forEach(kString => {
            delete $.hotkeyInputWhitelist[kString];
        });
        el._kStringList.forEach(kString => {
            removeHotkeyMap(kString, el._title);
        });
        delete el._onKeyDown;
        delete el._hotKeyInputWhitelist;
    }
}

export default {
    install (Vue) {
        Vue.directive('hotkey', {
            bind (el, binding, vnode) {
                registerHotkey(el, binding, vnode);
            },
            update (el, binding, vnode) {
                registerHotkey(el, binding, vnode);
            },
            unbind (el) {
                unregisterHotkey(el);
            }
        });
    }
};