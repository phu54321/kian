<template lang="pug">
    span {{rendered}}
</template>

<script>

export default {
    props: ['keys'],
    computed: {
        rendered () {
            let splitKey = this.keys.toUpperCase()
                .split('+')
                .map(x => x.trim())
                .filter(x => x);
            const isMac = navigator.appVersion.indexOf('Mac') > -1;
            if(isMac) {
                const macConvertTable = {
                    CTRL: '⌘',
                    ALT: '⌥',
                    SHIFT: '⇧',
                    ENTER: '↵',
                    BACKSLASH: '⌫',
                };
                splitKey = splitKey.map((x) => {
                    if(macConvertTable[x]) return macConvertTable[x];
                    else return x;
                });
            }
            return splitKey.join('+');
        }
    }
};

</script>

<style scoped>

kbd {
    font-size: 1em;
}
</style>
