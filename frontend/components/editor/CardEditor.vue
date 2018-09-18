// Copyright (C) 2018 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

<template lang='pug'>

b-form(@submit='onSave')
    span.invisible(@click='onSave', v-hotkey="['CTRL+ENTER', 'ctrl+s']", title='Save note')
    table.note-zone
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
                quick-model-selector.mt-2(v-model='card.model')

        template(v-for='(fFormat, index) in card.fieldFormats', v-if='!fFormat.hidden')
            tr
                td.editor-row(colspan='2')
                    .mb-2.font-weight-bold {{fFormat.name}}
                    tui-summernote.editor-field(v-model='card.fields[index]', :modelData='modelData')

        tr
            th Tags
            td
                tag-editor(v-model='card.tags')
</template>

<script>

import ankiCall from '~/api/ankiCall';
import ListSelector from '../common/ListSelector';
import Summernote from './Summernote/Summernote';
import TuiSummernote from './TuiSummernote';
import TagEditor from '../common/TagEditor';
import QuickModelSelector from './QuickModelSelector';
import './editor.scss';
import { runHook } from '~/utils/hookBase';

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
            card: runHook('edit_card_load', this.value),
            unloadHandle: null,
        };
    },
    components: {
        Summernote,
        ListSelector,
        TagEditor,
        TuiSummernote,
        QuickModelSelector,
    },
    methods: {
        unloadHandler () { return 'Really leave?'; },
        onSave () {
            const newCard = runHook('edit_card_save', Object.assign({}, this.card));
            this.$emit('save', newCard);
            this.$el.querySelectorAll('.editor-field')[0].focus();
        },
        tagRenderer (tag) {
            if(tag === 'marked') return {
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
    asyncComputed: {
        modelData: {
            get () {
                if (!this.currentModel) return {};
                return ankiCall('model_get', {modelName: this.currentModel});
            },
            default: {},
        }
    },
    computed: {
        currentModel () {
            return this.card.model;
        },
    },
    watch: {
        value (value) {
            this.card = runHook('edit_card_load', value);
        },
        async currentModel (modelName, oldModelName) {
            // Model change
            if(!modelName) {
                this.card.model = oldModelName;
                return;
            }

            const model = await ankiCall('model_get', { modelName });
            const fieldFormats = model.fieldFormats;
            this.card.fieldFormats = fieldFormats;
            const newFields = this.card.fields;
            resize(newFields, fieldFormats.length, '');
            this.card.fields = newFields;
            this.card = runHook('edit_card_load', this.card);
        },
    }
};

</script>

<style lang='scss' scoped>

.note-zone {
    td, th {
        padding: .75em 0;
        &.editor-row {
            padding: .4em 0 .5em 0;
        }
    }
}
</style>