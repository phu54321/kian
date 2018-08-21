import $ from 'jquery';
import './jquery.hotkeys';
import { addHotkeyMap, removeHotkeyMap } from './HotkeyMap';

const classRules = {
    multiselect: (el) => el.focus(),
    'dropdown-toggle': (el) => el.dispatchEvent(new Event('mousedown')),
};

const tagNameRules = {
    a: (el) => el.click(),
    button: (el) => el.click(),
};

function triggerHotkey (el, _binding, _vnode) {
    const $el = $(el);
    const {left, top} = $el.offset();
    const width = $el.width();
    const height = $el.height();
    let targetEl = document.elementFromPoint(left + width / 2, top + height / 2);

    while(targetEl !== null) {
        const $target = $(targetEl);
        Object.keys(classRules).forEach(cls => {
            if ($target.hasClass(cls)) {
                classRules[cls](targetEl);
                return;
            }
        });

        const targetTagName = targetEl.tagName.toLowerCase();
        const nameRule = tagNameRules[targetTagName];
        if(nameRule) {
            nameRule(targetEl);
            return;
        }

        if(targetEl === el) break;
        targetEl = targetEl.parentElement;
    }

    // Fallback
    el.click();
}


function registerHotkey (el, binding, vnode) {
    if (el._onKeyDown) unregisterHotkey(el);

    let hotkeyList = binding.value;
    if (typeof hotkeyList === 'string') hotkeyList = [hotkeyList];
    const hotkeyString = hotkeyList.map(x => x.toLowerCase());
    const attrs = vnode.data.attrs;
    const title = (attrs.title) ? attrs.title : $(el).text();

    function onKeyDown (e) {
        triggerHotkey(el, binding, vnode);
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
        if(kString.indexOf('ctrl') !== -1 || kString.indexOf('alt') !== -1) {
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