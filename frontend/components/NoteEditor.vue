<template lang="pug">
div(v-if='note')
    span Model: {{model}}
    
    // Toolbar
    div
        b-btn(v-shortkey.once="{ single: ['ctrl', 'shift', 'c'], multi: ['ctrl', 'shift', 'f'] }" @shortkey="onCloze") Cloze
    // Editing area
    div(v-for='field in note.fields', :key='field.fieldFormat.name')
        span.font-weight-bold {{field.fieldFormat.name}}
        content-editable-div(v-model='field.value')
</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import ContentEditableDiv from './editor/ContentEditableDiv';
import $ from 'jquery';

function fragFromHtml (html) {
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node;
    while((node = tmpDiv.firstChild)) {
        frag.appendChild(node);
    }
    return frag;
}

function wrap (front, back) {
    var s = window.getSelection();
    var r = s.getRangeAt(0);
    var content = r.extractContents();

    var span = document.createElement('span');
    span.appendChild(content);
    const oldHtml = span.innerHTML;

    var match = oldHtml.match(/^(\s*)([^]*?)(\s*)$/);
    var newHtml = match[1] + front + match[2] + back + match[3];
    var frag = fragFromHtml(newHtml);
    
    r.deleteContents();
    r.insertNode(frag);
    r.collapse();
    console.log('start', r.startContainer, r.startOffset);
    console.log('end', r.endContainer, r.endOffset);

    if (!oldHtml) {
        // run with an empty selection; move cursor back past postfix
        console.log(r.startContainer, r.startOffset);
        r.setStart(r.startContainer, r.startOffset - back.length);
    }
}

function getLastClozeId (code){
    let maxClozeId = 0;
    code.replace(/\{\{c(\d+)::/g, (match, g1) => {
        const clozeId = parseInt(g1);
        if (maxClozeId < clozeId) maxClozeId = clozeId;
    });
    return maxClozeId;
}

export default {
    props: ['noteId'],
    components: {
        ContentEditableDiv,
    },
    methods: {
        onCloze (event) {
            const lastClozeId = getLastClozeId ($(this.$el).html());
            const thisClozeId = {
                single: lastClozeId + 1,
                multi: (lastClozeId || 1),
            }[event.srcKey];
            wrap(`{{c${thisClozeId}::`, '}}');
        }
    },
    data () {
        return {
            model: null,
            note: null,
        };
    },
    mixins: [asyncData(async props => {
        const noteId = props.noteId;
        const note = await ankiCall('note_info', {noteId});
        return {
            note,
            model: note.model
        };
    })],
    name: 'note-editor',
};

</script>
