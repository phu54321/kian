<template lang='pug'>

iframe(:src='svgUrl', width='100%', height='100%')

</template>

<script>

export default {
    props: ['value'],

    data () {
        return {
            svgUrl: `/imgocld/svgedit/svg-editor.html?url=${encodeURIComponent(this.value)}`,
        };
    },
};

</script>
