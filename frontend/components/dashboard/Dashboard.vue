<template lang="pug">
div
    h2 Deck list
    
    deck-tree-view(:tree='deckDueTree', :indent='0')
</template>

<script>
import { ankiCall } from '../../api';
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
        ankiCall('dashboard_deck_tree')
            .then(response => {
                this.deckDueTree = response;
            });
    },
    name: 'dashboard',
};
</script>