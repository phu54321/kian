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

const hotkeyHandlersMap = new Map();

function addHotkeyToMap (kString, vnode, title, maxHotkeyDepth) {
    if(!hotkeyHandlersMap.has(kString)) {
        hotkeyHandlersMap.set(kString, []);
        $(document).bind('keydown', kString, (e) => {
            const activeElement = e.target || document.body;
            const matchedHandler = resolveHotkey(kString, activeElement);
            if(matchedHandler) {
                e.stopPropagation();
                e.preventDefault();
                return clickVNode(matchedHandler.vnode);
            }
        });
    }

    // Remove any duplicate hotkeys that might exists
    const targetEl = vnode.elm;
    removeHotkeyFromMap(kString, targetEl);

    // Add hotkey to element and all of the ancestors
    hotkeyHandlersMap.get(kString).push({
        targetEl,
        vnode,
        title,
        maxHotkeyDepth
    });
}

function removeHotkeyFromMap (kString, targetEl) {
    if(!hotkeyHandlersMap.has(kString)) return;
    const handlerList = hotkeyHandlersMap.get(kString);
    const index = handlerList.findIndex((e) => e.targetEl === targetEl);
    if(index === -1) return;
    handlerList.splice(index, 1);
}

function resolveHotkey (kString, activeElement) {
    const parentsFromActiveElement = [];
    for(let el = activeElement; el ; el = el.parentElement) {
        parentsFromActiveElement.push(el);
    }

    const handlerList = hotkeyHandlersMap.get(kString);
    let matchedHandler = null;
    let matchedElementIndex = parentsFromActiveElement.length;

    for(const handler of handlerList) {
        const {targetEl, } = handler;
        let maxHotkeyDepth = handler.maxHotkeyDepth || 10000;

        for(let el = targetEl ; el ; el = el.parentElement) {
            const elIndex = parentsFromActiveElement.indexOf(el);
            if(elIndex !== -1 && elIndex <= matchedElementIndex) {
                if(elIndex === matchedElementIndex) matchedHandler = null;
                else matchedHandler = handler;
                matchedElementIndex = elIndex;
                break;
            }
            if(--maxHotkeyDepth === 0) break;
        }
    }

    return matchedHandler;
}

export function getHotkeyMap (el) {
    const ret = {};

    el = el || document.body;
    for(const kString of hotkeyHandlersMap.keys()) {
        const handler = resolveHotkey(kString, el);
        if(handler) {
            ret[kString] = handler.title;
        }
    }
    return ret;
}



function registerHotkey (el, binding, vnode) {
    let hotkeyList = binding.value;
    if (typeof hotkeyList === 'string') hotkeyList = [hotkeyList];
    const hotkeyString = hotkeyList.map(x => x.toLowerCase());
    const attrs = vnode.data.attrs;
    const title = (attrs && attrs.title) ? attrs.title : ($(el).text() || '(untitled hotkey)');

    for(let kString of hotkeyString) {
        addHotkeyToMap(kString, vnode, title, binding.arg | 0);
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

        Vue.component('hotkey-pack', {
            props: ['depth', 'pack'],
            render (h) {
                return h(
                    'div',
                    { class: { invisible: true } },
                    this.pack.map(([key, value]) => h('span', {
                        directives: [
                            { name: 'hotkey', arg: this.depth + 1, value: key }
                        ],
                    }, [value]))
                );
            },
        });
    }
};