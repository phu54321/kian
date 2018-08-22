<template lang="pug">
    span.kimg
        span.modifier
            span(v-if='hasCtrl', :title='isMac ? "Command" : "Ctrl"') ⌘
            span(v-if='hasAlt', :title='isMac ? "Option" : "Alt"') ⌥
            span(v-if='hasShift', :title='"Shift"') ⇧
        .mainKey(:title='renderMainKey == this.rendered[1] ? undefined : this.rendered[1]') {{renderMainKey}}
</template>

<script>

const isMac = navigator.appVersion.indexOf('Mac') > -1;
export const specialCharTable = {
    CTRL: isMac ? '⌘' : '⌃',
    ALT: '⌥',
    SHIFT: '⇧',
    ENTER: '↩',
    DELETE: '⌫',
    BACKSLASH: '⌫',
    ESC: '⎋',
    RIGHT: '→',
    UP: '↑',
    LEFT: '←',
    DOWN: '↓',
    TAB: '⇥'
};

function firstLetterUpper(s) {
    return s[0].toUpperCase() + s.substr(1).toLowerCase();
}

export default {
    props: ['keys'],
    computed: {
        isMac () { return isMac; },
        hasCtrl () { return this.rendered[0].hasCtrl; },
        hasAlt () { return this.rendered[0].hasAlt; },
        hasShift () { return this.rendered[0].hasShift; },
        renderMainKey () {
            const mainKey = this.rendered[1];
            return (specialCharTable[mainKey.toUpperCase()] || firstLetterUpper(mainKey));
        },
        rendered () {
            let splitKey = this.keys.toUpperCase()
                .split('+')
                .map(x => x.trim());
            function hasSpecialKey (x) {
                const index = splitKey.indexOf(x);
                if(index !== -1) {
                    splitKey.splice(index, 1);
                    return true;
                } else return false;
            }
            const hasCtrl = hasSpecialKey('CTRL');
            const hasAlt = hasSpecialKey('ALT');
            const hasShift = hasSpecialKey('SHIFT');
            if(splitKey.length >= 2) return [{}, this.keys];  // Not renderable
            const mainKey = splitKey.length == 1 ? splitKey[0] : '';
            return [
                { hasCtrl, hasAlt, hasShift },
                firstLetterUpper(mainKey)
            ];
        }
    }
};

</script>

<style scoped lang='scss'>

.kimg {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: bold;

    display: inline-block;
    width: 5em;
    text-align: right;
    color: #666;

    .modifier {
        color: #bbb;
        letter-spacing: .2em;
    }
    .mainKey {
        display: inline-block;
        width: 1.5em;
        text-align: right;
    }
}

</style>
