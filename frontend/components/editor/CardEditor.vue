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
    span.invisible(@click='onSave', v-hotkey=['CTRL+ENTER', 'ctrl+s'], title='Save note')
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

        tr(v-for='(fFormat, index) in card.fieldFormats', :key='fFormat.name')
            th {{fFormat.name}}
            td
                summernote.editor-field(v-model='card.fields[index]')

        tr
            th Tags
            td
                tag-editor(v-model='card.tags')
</template>

<script>

import {ankiCall} from '../../api/ankiCall';
import ListSelector from './ListSelector';
import Summernote from './Summernote/Summernote';
import TagEditor from './TagEditor';
import './editor.scss';
import { addHotkeyPack, removeHotkeyPack } from '../../utils/VueSimpleHotkey';

const editorHotkeys = [
    ['Anki-related keys', [
        ['Ctrl + Shift + C', 'Cloze w/ new number'],
        ['Ctrl + Shift + F', 'Cloze w/ same number'],
    ]],

    ['Text editing', [
        ['CTRL+B', 'Bold'],
        ['CTRL+I', 'Italic'],
        ['CTRL+U', 'Underline'],
        ['CTRL+SHIFT+S', 'Strikethrough'],
        ['CTRL+K', 'Create link'],
        ['CTRL+BACKSLASH', 'Remove formatting'],
    ]],

    ['Paragraph-level editing', [
        ['Ctrl + Shift + D', 'Create table from selection'],
        ['CTRL+SHIFT+7', 'Insert unordered list'],
        ['CTRL+SHIFT+8', 'Insert ordered list'],
        ['CTRL+SHIFT+L', 'Justify to left'],
        ['CTRL+SHIFT+E', 'Justify to center'],
        ['CTRL+SHIFT+R', 'Justify to right'],
        ['CTRL+SHIFT+J', 'Justify to both sides (default)'],
    ]],

    ['Pan-paragraph level editing', [
        ['CTRL+0', 'Convert to normal paragraph'],
        ['CTRL+1~6', 'Convert to headings (h1~h6)'],
        ['CTRL+]', 'Indent text'],
        ['CTRL+[', 'Outdent text'],
        ['CTRL+SHIFT+X', 'HTML edit'],
    ]],
];


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
    mounted () {
        addHotkeyPack('editor', editorHotkeys);
    },
    beforeDestroy () {
        removeHotkeyPack('editor');
    },
    components: {
        Summernote,
        ListSelector,
        TagEditor,
    },
    methods: {
        onSave () {
            this.$emit('save');
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
