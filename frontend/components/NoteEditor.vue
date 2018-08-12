<template lang="pug">
div
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
            td
                list-selector(v-model='model', apiType='model_list', disabled)

        tr
            th Tags
            td
                tag-editor(v-model='tags')

        tr(v-for='(fFormat, index) in fieldFormats', :key='fFormat.name')
            th {{fFormat.name}}
            td
                summernote(v-model='fields[index]')

</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import Summernote from './editor/Summernote';
import EditorShortcut from './editor/shortcut/EditorShortcut';
import ErrorDialog from './ErrorDialog';
import ListSelector from './ListSelector';
import TagEditor from './editor/TagEditor';

export default {
    props: ['noteId'],
    components: {
        Summernote,
        EditorShortcut,
        ListSelector,
        TagEditor,
    },
    data () {
        return {
            model: '',
            tags: [],
            fields: [],
            fieldFormats: [],
        };
    },
    methods: {
        save () {
            ankiCall('note_update', {
                noteId: this.noteId,
                fields: this.fields.map(x => x.value),
                tags: this.tags,
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
        console.log(note);
        return {
            model: note.model,
            deck: note.deck,
            fields: note.fields,
            fieldFormats: note.fieldFormats,
            tags: note.tags,
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

