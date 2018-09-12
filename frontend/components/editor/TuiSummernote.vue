<template lang="pug">

tui-editor(v-if='isMarkdown', :value='value', @input='v => $emit("input", v)')
summernote(v-else, :value='value', @input='v => $emit("input", v)')

</template>

<script>

import TuiEditor from './TuiEditor/TuiEditor';
import Summernote from './Summernote/Summernote';

export default {
    props: ['value'],
    computed: {
        isMarkdown () {
            return TuiEditor.isEditableHtml(this.value);
        },
    },
    components: {
        TuiEditor,
        Summernote,
    },
};

</script>
