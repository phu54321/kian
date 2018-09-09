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
import _ from 'lodash';

export const elementHotkeyMap = new Map();
export const boundKStringSet = new Set();

function addHotkeyToMap (kString, vnode, title) {
    if(!boundKStringSet.has(kString)) {
        $(document).bind('keydown', kString, resolveHotkey(kString));
    }

    // Remove any duplicate hotkeys that might exists
    const targetEl = vnode.elm;
    removeHotkeyFromMap(kString, targetEl);

    // Add hotkey to element and all of the ancestors
    const handlerEntry = {
        targetEl,
        vnode,
        title,
    };

    for(let el = vnode.elm ; el ; el = el.parentElement) {
        if(!elementHotkeyMap.has(el)) elementHotkeyMap.set(el, new Map());
        const kStringHandlerMap = elementHotkeyMap.get(el);
        if(kStringHandlerMap.has(kString)) kStringHandlerMap.get(kString).push(handlerEntry);
        else kStringHandlerMap.set(kString, [handlerEntry]);
    }
}

function removeHotkeyFromMap (kString, targetEl) {
    // Add hotkey to element and all of the ancestors
    for(let el = targetEl ; el; el = el.parentElement) {
        if(!elementHotkeyMap.has(el)) continue;

        const kStringHandlerMap = elementHotkeyMap.get(el);

        if(!kStringHandlerMap.has(kString)) continue;
        const hotkeyHandlers = kStringHandlerMap.get(kString);
        // vnode may be different from each call, but targetEl is fixed (since it's a real element)
        // so, we get hotkeyIdx by finding targetEl.
        const hotkeyIdx = _.findIndex(hotkeyHandlers, entry => entry.targetEl === targetEl);
        if(hotkeyIdx === -1) continue;

        hotkeyHandlers.splice(hotkeyIdx, 1);
        if(hotkeyHandlers.length === 0) {
            kStringHandlerMap.delete(kString);
            if(kStringHandlerMap.length === 0) {
                elementHotkeyMap.delete(el);
            }
        }
    }
}

function resolveHotkey (kString) {
    return (e) => {
        let el = e.target;
        for(; el; el = el.parentElement) {
            if(!elementHotkeyMap.has(el)) continue;

            const kStringHandlerMap = elementHotkeyMap.get(el);
            if(!kStringHandlerMap.has(kString)) continue;

            const hotkeyHandlers = kStringHandlerMap.get(kString);
            if(hotkeyHandlers.length !== 1) return;

            e.stopPropagation();
            e.preventDefault();
            return clickVNode(hotkeyHandlers[0].vnode);
        }
    };
}

export function getHotkeyMap (el) {
    const hotkeyMap = {};

    el = el || document.body;

    for(; el; el = el.parentElement) {
        if(!elementHotkeyMap.has(el)) continue;

        const kStringHandlerMap = elementHotkeyMap.get(el);
        for(let kString of kStringHandlerMap.keys()) {
            const hotkeyHandlers = kStringHandlerMap.get(kString);
            if(hotkeyHandlers.length !== 1) continue;
            hotkeyMap[kString] = hotkeyHandlers[0].title;
        }
    }

    return hotkeyMap;
}



function registerHotkey (el, binding, vnode) {
    let hotkeyList = binding.value;
    if (typeof hotkeyList === 'string') hotkeyList = [hotkeyList];
    const hotkeyString = hotkeyList.map(x => x.toLowerCase());
    const attrs = vnode.data.attrs;
    const title = (attrs && attrs.title) ? attrs.title : ($(el).text() || '(untitled hotkey)');

    for(let kString of hotkeyString) {
        addHotkeyToMap(kString, vnode, title);
    }

    el.dataset.hotkeyString = hotkeyString.join('|');
}

function unregisterHotkey (el) {
    const hotkeyString = el.dataset.hotkeyString.split('|');
    for(let kString of hotkeyString) {
        removeHotkeyFromMap(kString, el);
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