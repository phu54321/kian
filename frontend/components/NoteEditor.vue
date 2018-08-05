<template lang="pug">
div(v-if='note')
    span Model: {{model}}
    div(v-for='field in note.fields', :key='field.fieldFormat.name')
        span.font-weight-bold {{field.fieldFormat.name}}
        content-editable-div(v-model='field.value')
</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import ContentEditableDiv from './editor/ContentEditableDiv';

export default {
    props: ['noteId'],
    components: {
        ContentEditableDiv,
    },
    data () {
        return {
            model: null,
            note: null,
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
    name: 'note-editor',
};

</script>
