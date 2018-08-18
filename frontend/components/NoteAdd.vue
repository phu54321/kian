<template lang="pug">
div
    h1 Add Note

    card-editor(v-model='card', @save='save')
    
    h3.mt-5 Recent addition
    browser-view.history(:cardIds='addedCardIds')



</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import ErrorDialog from './ErrorDialog';
import BrowserView from './browser/BrowserView';
import CardEditor from './editor/CardEditor';


function resize(arr, size, defval) {
    while (arr.length > size) { arr.pop(); }
    while (arr.length < size) { arr.push(defval); }
}

export default {
    props: ['noteId'],
    components: {
        CardEditor,
        BrowserView,
    },
    data () {
        return {
            card: {
                deck: '',
                model: '',
                fieldFormats: [],
                fields: [],
                tags: [],
            },
            addedCardIds: [],
        };
    },
    mixins: [asyncData(async props => {
        const createdCards = await ankiCall('browser_query', {
            query: '',
            sortBy: 'createdAt'
        });
        return {
            addedCardIds: createdCards.slice(0, 100)
        };
    })],
    methods: {
        async save () {
            const card = this.card;
            const {noteId, cardNum} = await ankiCall('note_add', {
                deck: card.deck,
                model: card.model,
                fields: card.fields,
                tags: card.tags,
            });

            // Clean non-sticky forms
            card.fieldFormats.forEach((fFormat, index) => {
                if(!fFormat.sticky) {
                    card.fields.splice(index, 1, '');
                }
            });

            // Add to history logs
            const cardIds = await ankiCall('cid_from_nid', {noteId});
            this.addedCardIds.splice(0, 0, ...cardIds);

            this.$toasted.show("Note added", { 
                icon: 'plus-square',
            });
        }
    },
    name: 'note-add',
};

</script>

<style lang="scss" scoped>

.history {
    height: 30em;
    overflow-y: scroll;
}

</style>
