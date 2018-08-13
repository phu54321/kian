import {INVERSE_KEY_MAP} from './keycode';
import $ from 'jquery';

function eventToKeySequence (e) {
    const s = [];
    if (e.ctrlKey || e.metaKey) s.push('CTRL');
    if (e.shiftKey) s.push('SHIFT');
    if (e.altKey) s.push('ALT');
    if (e.keyCode) s.push(INVERSE_KEY_MAP[e.keyCode]);
    return s.join('+');
}

function clickElement (el) {
    const $el = $(el);
    const {left, top} = $el.offset();
    const width = $el.width();
    const height = $el.height();
    const targetEl = document.elementFromPoint(left + width / 2, top + height / 2);

    targetEl.dispatchEvent(new Event('mousedown'));
    targetEl.dispatchEvent(new Event('mouseup'));
    targetEl.click();

}

function registerHotkey (el, binding) {
    if (el._keyDownHandler) unregisterHotkey(el);
    let hotkeyList = binding.value;
    if (typeof hotkeyList === 'string') hotkeyList = [hotkeyList];
    const appliableKey = hotkeyList.map(x => x.toUpperCase());

    if (binding.modifiers.down) {
        el._keyDownHandler = function (e) {
            if (appliableKey.indexOf(eventToKeySequence(e)) != -1) {
                clickElement(el);
                e.stopPropagation();
                e.preventDefault();
            }
        };
        el._keyUpHandler = function () {};
    } else {
        let lastPressedKeySequence = null;
        el._keyDownHandler = function (e) {
            lastPressedKeySequence = eventToKeySequence(e);
            if (appliableKey.indexOf(lastPressedKeySequence) != -1) {
                e.stopPropagation();
                e.preventDefault();
            }
        };
        el._keyUpHandler = function () {
            if (appliableKey.indexOf(lastPressedKeySequence) != -1) {
                clickElement(el);
            }
            lastPressedKeySequence = null;
        };
    }
    document.addEventListener('keydown', el._keyDownHandler, true);
    document.addEventListener('keyup', el._keyUpHandler);

}

function unregisterHotkey (el) {
    if (el._keyDownHandler) {
        document.removeEventListener('keydown', el._keyDownHandler, true);
        document.removeEventListener('keyup', el._keyUpHandler);
        el._keyDownHandler = undefined;
        el._keyUpHandler = undefined;
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