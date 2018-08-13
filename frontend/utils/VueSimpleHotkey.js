import $ from 'jquery';
import 'jquery.hotkeys';

const classRules = {
    multiselect: (el) => el.focus(),
};

const tagNameRules = {
    a: (el) => el.click(),
};

function triggerHotkey (el, _binding, _vnode) {
    const $el = $(el);
    const {left, top} = $el.offset();
    const width = $el.width();
    const height = $el.height();
    let targetEl = document.elementFromPoint(left + width / 2, top + height / 2);

    for(;;) {
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
}

function registerHotkey (el, binding, vnode) {
    if (el._onKeyDown) unregisterHotkey(el);

    let hotkeyList = binding.value;
    if (typeof hotkeyList === 'string') hotkeyList = [hotkeyList];
    const hotkeyString = hotkeyList.map(x => x.toLowerCase());

    function onKeyDown (e) {
        triggerHotkey(el, binding, vnode);
        e.stopPropagation();
        e.preventDefault();
    }

    el._onKeyDown = onKeyDown;
    hotkeyString.forEach(kString => {
        $(document).bind('keydown', kString, el._onKeyDown);
    });
}

function unregisterHotkey (el) {
    if (el._onKeyDown) {
        $(document).unbind('keydown', el._onKeyDown);
        el._onKeyDown = undefined;
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