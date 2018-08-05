<template lang="pug">
div(v-if='note')
    span Model: {{model}}
    div(v-for='field in note.fields', :key='field.fieldFormat.name')
        span.font-weight-bold {{field.fieldFormat.name}}
        trumbowyg(v-model='field.value', :config='config')
</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';

export default {
    props: ['noteId'],
    data () {
        return {
            model: null,
            note: null,
            config: {
                autogrow: true,
                btns: [
                    ['viewHTML'],
                    ['undo', 'redo'],
                    ['formatting'],
                    ['strong', 'em', 'del'],
                    ['superscript', 'subscript'],
                    ['link'],
                    ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                    ['unorderedList', 'orderedList'],
                    ['horizontalRule'],
                    ['removeformat'],
                    ['preformatted'],
                ]
            }
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
