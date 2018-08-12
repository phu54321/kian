import {INVERSE_KEY_MAP} from './keycode';

function eventToKeySequence (e) {
    const s = [];
    if (e.ctrlKey || e.metaKey) s.push('CTRL');
    if (e.shiftKey) s.push('SHIFT');
    if (e.altKey) s.push('ALT');
    if (e.keyCode) s.push(INVERSE_KEY_MAP[e.keyCode]);
    return s.join('+');
}

function registerHotkey (el, binding) {
    if (el._keyDownHandler) unregisterHotkey(el);
    let hotkeyList = binding.value;
    if (typeof hotkeyList === 'string') hotkeyList = [hotkeyList];
    const appliableKey = hotkeyList.map(x => x.toUpperCase());
    const eventType = ['hotkey', 'click'];

    if (binding.modifiers.down) {
        el._keyDownHandler = function (e) {
            if (appliableKey.indexOf(eventToKeySequence(e)) != -1) {
                eventType.forEach(evt => {
                    el.dispatchEvent(new Event(evt));
                });
                e.stopPropagation();
                e.preventDefault();
            }
        };
        el._keyUpHandler = function () {};
    } else {
        let lastPressedKeySequence = null;
        el._keyDownHandler = function (e) {
            lastPressedKeySequence = eventToKeySequence(e);
        };
        el._keyUpHandler = function () {
            if (appliableKey.indexOf(lastPressedKeySequence) != -1) {
                eventType.forEach(evt => {
                    el.dispatchEvent(new Event(evt));
                });
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