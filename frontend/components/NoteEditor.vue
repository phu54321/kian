<template lang="pug">
div(v-if='note')
    span Model: {{model}}
    div(v-for='field in note.fields', :key='field.fieldFormat.name')
        span.font-weight-bold {{field.fieldFormat.name}}
        summernote(v-model='field.value')
</template>

<script>

import {ankiCall} from '../api/ankiCall';
import Summernote from './editor/Summernote';
import asyncData from '../utils/asyncData';

export default {
    props: ['noteId'],
    components: { Summernote },
    data () {
        return {
            model: null,
            note: null
        };
    },
    mixins: [asyncData(async props => {
        const noteId = props.noteId;
        const note = await ankiCall('note_info', {noteId});
        return {
            note,
            model: note.model
        };
    })],
};

</script>
