<template lang='pug'>

b-form(@submit='onSave')
    div.mb-1.text-right
        icon.mr-3(name='regular/keyboard',
            v-b-modal.helpShortcut,
            v-b-tooltip.hover,
            scale='1.3',
            title='Show shortcuts')
        span(@click='onSave', v-hotkey=['CTRL+ENTER'], v-b-tooltip.hover, title='Save note')
            icon(name='regular/save')

    b-modal(size='lg', id='helpShortcut', title='Keyboard shortcuts')
        editor-shortcut(id='helpShortcut')
        div(slot='modal-footer')

    table.note-zone.table
        tr
            th Deck
            td
                list-selector(
                    taggable,
                    v-hotkey="['ctrl+d']",
                    v-model='card.deck',
                    :disabled='deckFixed',
                    apiType='deck_list')

        tr
            th Model
            td
                list-selector(
                    :disabled='modelFixed',
                    v-hotkey="['ctrl+m']",
                    v-model='card.model',
                    apiType='model_list')

        tr(v-for='(fFormat, index) in card.fieldFormats', :key='fFormat.name')
            th {{fFormat.name}}
            td
                summernote(v-model='card.fields[index]')

        tr
            th Tags
            td
                tag-editor(v-model='card.tags')
</template>

<script>

import {ankiCall} from '../../api/ankiCall';
import ListSelector from './ListSelector';
import Summernote from './Summernote';
import EditorShortcut from './shortcut/EditorShortcut';
import TagEditor from './TagEditor';


function resize(arr, size, defval) {
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
        EditorShortcut,
        ListSelector,
        TagEditor,
    },
    methods: {
        syncCard () {
            this.$emit('input', this.card);
        },  
        onSave () {
            console.log('onSave')
        }
    },
    computed: {
        currentModel () {
            return this.card.model;
        },
    },
    watch: {
        async currentModel (modelName) {
            // Model change
            const model = await ankiCall('model_get', { modelName });
            const fieldFormats = model.fieldFormats;
            this.card.fieldFormats = fieldFormats;
            const newFields = this.card.fields;
            resize(newFields, fieldFormats.length, '');
            this.card.fields = newFields;
        },
        card: {
            async handler (newValue, oldValue) {
                this.$emit('input', this.card);
            },
            deep: true,
        }
    }
};

</script>
