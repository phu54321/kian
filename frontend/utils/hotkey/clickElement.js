
import $ from 'jquery';

const classRules = {
    multiselect: (el) => el.focus(),
    'dropdown-toggle': (el) => el.dispatchEvent(new Event('mousedown')),
};

const tagNameRules = {
    a: (el) => el.click(),
    button: (el) => el.click(),
};

const vnodeNameRules = {
    'b-modal': (v) => v.show()
};

export function clickVNode (vnode) {
    const el = vnode.elm;

    if (vnode.componentOptions) {
        const vnodeName = vnode.componentOptions.tag;
        if (vnodeNameRules[vnodeName]) {
            return vnodeNameRules[vnodeName](vnode.context.$children[0]);
        }
    }

    const $el = $(el);
    const { left, top } = $el.offset();
    const width = $el.width();
    const height = $el.height();
    let targetEl = document.elementFromPoint(left + width / 2, top + height / 2);

    while (targetEl !== null) {
        const $target = $(targetEl);
        Object.keys(classRules).forEach(cls => {
            if ($target.hasClass(cls)) {
                classRules[cls](targetEl);
                return;
            }
        });

        const targetTagName = targetEl.tagName.toLowerCase();
        const nameRule = tagNameRules[targetTagName];
        if (nameRule) {
            nameRule(targetEl);
            return;
        }

        if (targetEl === el) break;
        targetEl = targetEl.parentElement;
    }

    // Fallback
    el.click();
}
