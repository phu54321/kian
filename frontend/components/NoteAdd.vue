<template lang="pug">
div
    b-form(@submit='save')
        span.float-right
            icon.mr-3(name='regular/keyboard',
                v-b-modal.helpShortcut,
                v-b-tooltip.hover,
                scale='1.3',
                title='Show shortcuts')
            span(@click='save', v-hotkey=['CTRL+ENTER'], v-b-tooltip.hover, title='Save note')
                icon(name='regular/save')
        h2 Add Note

        b-modal(size='lg', id='helpShortcut', title='Keyboard shortcuts')
            editor-shortcut(id='helpShortcut')
            div(slot='modal-footer')

        table.note-zone.table.table-borderless
            tr
                th Deck
                td
                    list-selector(v-hotkey="['ctrl+d']", v-model='deck', apiType='deck_list')

            tr
                th Model
                td
                    list-selector(v-hotkey="['ctrl+m']", v-model='model', apiType='model_list')

            tr
                th Tags
                td
                    tag-editor(v-model='tags')

            tr(v-for='(fFormat, index) in fieldFormats', :key='fFormat.name')
                th {{fFormat.name}}
                td
                    summernote(v-model='fields[index]')
        
    browser-view.mt-4(:cardIds='addedCardIds')


</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import Summernote from './editor/Summernote';
import EditorShortcut from './editor/shortcut/EditorShortcut';
import ErrorDialog from './ErrorDialog';
import ListSelector from './editor/ListSelector';
import TagEditor from './editor/TagEditor';
import BrowserView from './browser/BrowserView';
import './editor/editor.scss';

function resize(arr, size, defval) {
    while (arr.length > size) { arr.pop(); }
    while (arr.length < size) { arr.push(defval); }
}

export default {
    props: ['noteId'],
    components: {
        Summernote,
        EditorShortcut,
        TagEditor,
        ListSelector,
        BrowserView,
    },
    data () {
        return {
            deck: '',
            model: '',
            fieldFormats: [],
            fields: [],
            tags: [],
            addedCardIds: [],
        };
    },
    methods: {
        async save () {
            const {noteId, cardNum} = await ankiCall('note_add', {
                deck: this.deck,
                model: this.model,
                fields: this.fields,
                tags: this.tags,
            });

            // Clean non-sticky forms
            this.fieldFormats.forEach((fFormat, index) => {
                if(!fFormat.sticky) {
                    this.fields.splice(index, 1, '');
                }
            });

            // Add to history logs
            const cardIds = await ankiCall('cid_from_nid', {noteId});
            cardIds.forEach(cardId => {
                this.addedCardIds.push(cardId);
            });

            this.$toasted.show("Note added", { 
                icon: 'plus-square',
            });
        }
    },
    watch: {
        async model (modelName) {
            const model = await ankiCall('model_get', { modelName });
            const fieldFormats = model.fieldFormats;
            this.fieldFormats = fieldFormats;
            const newFields = this.fields;
            resize(newFields, fieldFormats.length, '');
            this.fields = newFields;
        },
    },
    name: 'note-add',
};

</script>

