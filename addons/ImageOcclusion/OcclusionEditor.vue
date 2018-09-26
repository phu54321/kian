<template lang='pug'>

.editor
    .editor-header
        h2 Image occlusion revisited
    .editor-body
        svg-edit(v-model='svg')
    .editor-footer

</template>

<script>

const initialSVGUrl = '/imgocld/svgedit/test.svg';

import SvgEdit from './SvgEdit';

export default {
    components: {
        SvgEdit,
    },
    data () {
        return {
            svg: initialSVGUrl,
        };
    },
};

</script>

<style scoped lang='scss'>

.editor {
    display: flex;
    flex-direction: column;
    height: 100%;

    .editor-body {
        flex: 1;
        overflow-y: hidden;
        iframe {
            border: none;
        }
    }
}

</style>
