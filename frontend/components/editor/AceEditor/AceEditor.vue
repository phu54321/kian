<template lang="pug">
    editor(:value="value", @input='value => $emit("input", value)', @init="editorInit", lang="html", :height='height', theme="chrome")
</template>

<script>

export default {
    props: ['value', 'height'],
    components: {
        editor: require('vue2-ace-editor'),
    },
    methods: {
        editorInit () {
            require('brace/ext/language_tools');
            require('brace/mode/html');
            require('brace/mode/javascript');
            require('brace/theme/chrome');
            require('brace/snippets/javascript');
        },
    },
};

</script>
