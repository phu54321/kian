<template lang="pug">
b-form(@submit='save')
    span.float-right
        icon.mr-3(name='regular/keyboard',
            v-b-modal.helpShortcut,
            v-b-tooltip.hover,
            scale='1.3',
            title='Show shortcuts')
        span(@click='save', v-hotkey.nofilter=['CTRL+ENTER'], v-b-tooltip.hover, title='Save note')
            icon(name='regular/save')

    h2 Edit card

    b-modal(size='lg', id='helpShortcut', title='Keyboard shortcuts')
        editor-shortcut(id='helpShortcut')
        div(slot='modal-footer')

    table.note-zone.table
        tr
            th Deck
            td
                list-selector(v-hotkey="['ctrl+d']", v-model='deck', apiType='deck_list')
        tr
            th Model
            td
                list-selector(v-model='model', apiType='model_list', disabled)

        tr(v-for='(fFormat, index) in fieldFormats', :key='fFormat.name')
            th {{fFormat.name}}
            td
                summernote(v-model='fields[index]')

        tr
            th Tags
            td
                tag-editor(v-model='tags')

</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import Summernote from './editor/Summernote';
import EditorShortcut from './editor/shortcut/EditorShortcut';
import ErrorDialog from './ErrorDialog';
import ListSelector from './editor/ListSelector';
import TagEditor from './editor/TagEditor';
import './editor/editor.scss';

export default {
    props: {
        cardId: Number,
    },
    components: {
        Summernote,
        EditorShortcut,
        ListSelector,
        TagEditor,
    },
    data () {
        return {
            deck: '',
            model: '',
            tags: [],
            fields: [],
            fieldFormats: [],
        };
    },
    methods: {
        save () {
            ankiCall('card_update', {
                cardId: this.cardId,
                deck: this.deck,
                fields: this.fields,
                tags: this.tags,
            }).then(() => {
                this.$router.go(-1);
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
            });
        }
    },
    mixins: [asyncData(async props => {
        const cardId = props.cardId;
        const card = await ankiCall('card_get', {cardId});
        return {
            model: card.model,
            deck: card.deck,
            fields: card.fields,
            fieldFormats: card.fieldFormats,
            tags: card.tags,
        };
    })],
    name: 'card-editor',
};

</script>
