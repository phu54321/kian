import {INVERSE_KEY_MAP} from './keycode';

export default {
    install (Vue) {
        Vue.directive('hotkey', {
            bind (el, binding, _vnode, _oldVnode) {
                const appliableKey = binding.value.map(x => x.toUpperCase());
                el._keyHandler = function (e) {
                    const s = [];
                    if (e.ctrlKey || e.metaKey) s.push('CTRL');
                    if (e.shiftKey) s.push('SHIFT');
                    if (e.altKey) s.push('ALT');
                    if (e.keyCode) s.push(INVERSE_KEY_MAP[e.keyCode]);
                    const hotkeyString = s.join('+');
                    if(appliableKey.indexOf(hotkeyString) != -1) {
                        el.dispatchEvent(new Event('click'));
                    }
                }
                document.addEventListener('keydown', el._keyHandler);
            },
            unbind (el, _binding, _vnode, _oldVnode) {
                document.removeEventListener('keydown', el._keyHandler);
            }
        });
    }
};