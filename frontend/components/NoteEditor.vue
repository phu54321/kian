<template lang="pug">
div(v-if='note')
    span.float-right
        icon.mr-3(name='regular/keyboard',
            v-b-modal.helpShortcut,
            v-b-tooltip.hover,
            scale='1.3',
            title='Show shortcuts')
        span(@click='save', v-hotkey=['CTRL+ENTER'], v-b-tooltip.hover, title='Save note')
            icon(name='regular/save')

    b-modal(size='lg', id='helpShortcut', title='Keyboard shortcuts')
        editor-shortcut(id='helpShortcut')
        div(slot='modal-footer')

    table.note-zone.table
        tr
            th Model
            td {{model}}

        tr
            th Tags
            td
                tag-editor(v-model='note.tags')

        tr(v-for='(fFormat, index) in note.fieldFormats', :key='fFormat.name')
            th {{fFormat.name}}
            td
                summernote(v-model='note.fields[index]')


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
            ankiCall('note_update', {
                noteId: this.noteId,
                fields: this.note.fields.map(x => x.value),
                tags: this.note.tags,
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

<style lang="scss" scoped>

table.note-zone {
    th {
        width: 15%;
        padding-right: 1em;
    }
}

</style>

