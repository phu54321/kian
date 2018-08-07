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
    const appliableKey = binding.value.map(x => x.toUpperCase());
    if (binding.modifiers.up) {
        let lastPressedKeySequence = null;
        el._keyDownHandler = function (e) {
            lastPressedKeySequence = eventToKeySequence(e);
        };
        el._keyUpHandler = function () {
            if (appliableKey.indexOf(lastPressedKeySequence) != -1) {
                el.dispatchEvent(new Event('click'));
            }
            lastPressedKeySequence = null;
        };
    } else {
        el._keyDownHandler = function (e) {
            if (appliableKey.indexOf(eventToKeySequence(e)) != -1) {
                el.dispatchEvent(new Event('click'));
            }
        };
        el._keyUpHandler = function () {};
    }
    document.addEventListener('keydown', el._keyDownHandler);
    document.addEventListener('keyup', el._keyUpHandler);

}

function unregisterHotkey (el) {
    if (el._keyDownHandler) {
        document.removeEventListener('keydown', el._keyDownHandler);
        document.removeEventListener('keyup', el._keyUpHandler);
        el._keyDownHandler = undefined;
        el._keyUpHandler = undefined;
    }
}

export default {
    install (Vue) {
        Vue.directive('hotkey', {
            bind (el, binding) {
                registerHotkey(el, binding);
            },
            update (el, binding) {
                registerHotkey(el, binding);
            },
            unbind (el) {
                unregisterHotkey(el);
            }
        });
    }
};