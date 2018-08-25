<template lang='pug'>

b-form(@submit='onSave')
    span.invisible(@click='onSave', v-hotkey=['CTRL+ENTER', 'ctrl+s'], title='Save note')
    table.note-zone.table
        tr
            th Deck
            td
                list-selector(
                    taggable,
                    v-hotkey="['ctrl+d']",
                    title='Change deck'
                    v-model='card.deck',
                    :disabled='deckFixed',
                    apiType='deck_list')

        tr
            th Model
            td
                list-selector(
                    :disabled='modelFixed',
                    v-hotkey="['ctrl+m']",
                    title='Change model',
                    v-model='card.model',
                    apiType='model_list')

        tr(v-for='(fFormat, index) in card.fieldFormats', :key='fFormat.name')
            th {{fFormat.name}}
            td
                summernote(v-model='card.fields[index]')

        tr
            th Tags
            td
                space-seperated-input(
                    v-model='card.tags',
                    placeholder='Add new tags...',
                    :suggestions='fetchTags'
                    :renderer='tagRenderer')
</template>

<script>

import {ankiCall} from '../../api/ankiCall';
import ListSelector from './ListSelector';
import Summernote from './Summernote';
import SpaceSeperatedInput from '../common/SpaceSeperatedInput';
import './editor.scss';


function resize (arr, size, defval) {
    while (arr.length > size) { arr.pop(); }
    while (arr.length < size) { arr.push(defval); }
}


export default {
    props: [
        'deckFixed',
        'modelFixed',
        'value',
    ],
    data () {
        return {
            card: this.value
        };
    },
    components: {
        Summernote,
        ListSelector,
        SpaceSeperatedInput,
    },
    methods: {
        onSave () {
            this.$emit('save');
        },
        tagRenderer (tag) {
            if(tag == 'marked') return {
                variant: 'danger',
                title: tag
            };
        },
        async fetchTags (tag) {
            return ankiCall('tag_suggestions', {
                query: tag
            });
        }
    },
    computed: {
        currentModel () {
            return this.card.model;
        },
    },
    watch: {
        value: {
            handler (value) {
                this.card = value;
            },
            deep: true,
        },
        async currentModel (modelName) {
            // Model change
            const model = await ankiCall('model_get', { modelName });
            const fieldFormats = model.fieldFormats;
            this.card.fieldFormats = fieldFormats;
            const newFields = this.card.fields;
            resize(newFields, fieldFormats.length, '');
            this.card.fields = newFields;
        },
    }
};

</script>
