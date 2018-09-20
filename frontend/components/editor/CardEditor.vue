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
                    v-model='internalValue.deck',
                    :disabled='deckFixed',
                    apiType='deck_list')

        tr
            th Model
            td
                list-selector(
                    :disabled='modelFixed',
                    v-hotkey="['ctrl+m']",
                    title='Change model',
                    v-model='internalValue.model',
                    apiType='model_list')
                quick-model-selector.mt-2(v-model='internalValue.model')

        template(v-for='(fFormat, index) in internalValue.fieldFormats', v-if='!fFormat.hidden')
            tr
                td.editor-row(colspan='2')
                    .mb-2.font-weight-bold {{fFormat.name}}
                    tui-summernote.editor-field(v-model='internalValue.fields[index]', :modelData='modelData')

        tr
            th Tags
            td
                tag-editor(v-model='internalValue.tags')
</template>

<script>

import ListSelector from '../common/ListSelector';
import Summernote from './Summernote/Summernote';
import TuiSummernote from './TuiSummernote';
import TagEditor from '../common/TagEditor';
import QuickModelSelector from './QuickModelSelector';
import _ from 'lodash';

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
            internalValue: runHook('edit_card_load', _.clone(this.value)),
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
        onSave () {
            this.$el.querySelectorAll('.editor-field')[0].focus();
            this.$emit('save');
        },
        tagRenderer (tag) {
            if(tag === 'marked') return {
                variant: 'danger',
                title: tag
            };
        },
        async fetchTags (tag) {
            return this.$ankiCall('tag_suggestions', {
                query: tag
            });
        }
    },
    asyncComputed: {
        modelData: {
            get () {
                if (!this.currentModel) return {};
                return this.$ankiCall('model_get', {modelName: this.currentModel});
            },
            default: {},
        }
    },
    computed: {
        currentModel () {
            return this.internalValue.model;
        },
    },
    watch: {
        value: {
            handler (value) {
                this.internalValue = runHook('edit_card_load', _.clone(value));
            },
            deep: true,
        },
        internalValue: {
            handler (value) {
                const emitVal = runHook('edit_card_save', _.clone(value));
                if(_.isEqual(emitVal, this.value)) return;
                this.$emit('input', emitVal);
            },
            deep: true,
        },
        async currentModel (modelName, oldModelName) {
            // Model change
            if(!modelName) {
                this.internalValue.model = oldModelName;
                return;
            }

            const model = await this.$ankiCall('model_get', { modelName });
            const fieldFormats = model.fieldFormats;
            this.internalValue.fieldFormats = fieldFormats;
            const newFields = _.clone(this.internalValue.fields);
            resize(newFields, fieldFormats.length, '');
            this.internalValue.fields = newFields;
            this.internalValue = runHook('edit_card_load', this.internalValue);
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