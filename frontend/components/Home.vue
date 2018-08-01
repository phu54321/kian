<template lang="pug">
    v-container
        v-card
            v-card-title(primary-title)
                .h2 Deck list
            v-card-text
                deck-tree-view(:tree='deckDueTree', :indent='0')
</template>

<script>
import { ankiCall } from '../api';
import DeckTreeView from './DeckTreeView';

export default {
    data () {
        return {
            deckDueTree: []
        };
    },
    components: {
        DeckTreeView
    },
    created () {
        ankiCall('deck_due_tree')
            .then(response => {
                this.deckDueTree = response;
            });
    },
    name: 'home',
};
</script>