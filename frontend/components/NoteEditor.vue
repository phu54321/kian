<template lang="pug">
div(v-if='note')
    span Model: {{note.model}}
    div(v-for='field in note.fields', :key='field.fieldFormat.name')
        div {{field.fieldFormat.name}}
        summernote(v-model='field.value')
</template>

<script>

import Summernote from './editor/Summernote';

export default {
    props: ['note'],
    components: { Summernote }
};

</script>
