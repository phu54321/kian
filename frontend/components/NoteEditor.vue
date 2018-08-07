<template lang="pug">
div(v-if='note')
    span Model: {{model}}

    span.float-right
        icon.mr-3(name='regular/keyboard',
            v-b-modal.helpShortcut,
            v-b-tooltip.hover,
            scale='1.3',
            title='Show shortcuts')
        span(@click='save', v-hotkey=['CTRL+ENTER'], v-b-tooltip.hover, title='Save note')
            icon(name='regular/save')

    b-modal(id='helpShortcut', title='Keyboard shortcuts')
        editor-shortcut(id='helpShortcut')
        div(slot='modal-footer')

    // Editing area
    div(v-for='field in note.fields', :key='field.fieldFormat.name')
        span.font-weight-bold {{field.fieldFormat.name}}
        summernote(v-model='field.value')

    // Tags area
    tag-editor(v-model='note.tags')

</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import Summernote from './editor/Summernote';
import EditorShortcut from './editor/shortcut/EditorShortcut';
import ErrorDialog from './ErrorDialog';
import TagEditor from './editor/TagEditor';

export default {
    props: ['noteId'],
    components: {
        Summernote,
        EditorShortcut,
        TagEditor,
    },
    data () {
        return {
            model: null,
            note: null,
        };
    },
    methods: {
        save () {
            ankiCall('note_set', {
                noteId: this.noteId,
                fields: this.note.fields.map(x => x.value)
            }).then(() => {
                window.location.reload();
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
            });
        }
    },
    mixins: [asyncData(async props => {
        const noteId = props.noteId;
        const note = await ankiCall('note_get', {noteId});
        return {
            note,
            model: note.model
        };
    })],
    name: 'note-editor',
};

</script>
