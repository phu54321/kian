<template lang="pug">
div
    h1 Add Note
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
            th Deck
            td
                list-selector(v-model='deck', apiType='deck_list')

        tr
            th Model
            td
                list-selector(v-model='model', apiType='model_list')

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
        TagEditor,
        ListSelector,
    },
    data () {
        return {
            deck: '',
            model: '',
            fieldFormats: [],
            fields: [],
            tags: [],
        };
    },
    methods: {
        save () {
            console.log('Not implemented');
        }
    },
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

