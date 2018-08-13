import hotkeys from 'hotkeys-js';
import $ from 'jquery';

function clickElement (el) {
    const $el = $(el);
    const {left, top} = $el.offset();
    const width = $el.width();
    const height = $el.height();
    const targetEl = document.elementFromPoint(left + width / 2, top + height / 2);

    console.log(el, targetEl);
    targetEl.dispatchEvent(new MouseEvent('mousedown'));
    targetEl.dispatchEvent(new MouseEvent('mouseup'));
    targetEl.dispatchEvent(new MouseEvent('click'));
}

function registerHotkey (el, binding) {
    if (el._keyDownHandler) unregisterHotkey(el);

    let hotkeyList = binding.value;
    if (typeof hotkeyList === 'string') hotkeyList = [hotkeyList];
    const hotkeyString = hotkeyList.map(x => x.toLowerCase()).join(',');
    el._hotkeyString = hotkeyString;
 
    hotkeys(hotkeyString, function (e) {
        clickElement(el);
        console.log('click', hotkeyString, el);
        e.stopPropagation();
        e.preventDefault();
    });

}

function unregisterHotkey (el) {
    if (el._hotkeyString) {
        hotkeys.unbind(el._hotkeyString);
        el._hotkeyString = undefined;
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