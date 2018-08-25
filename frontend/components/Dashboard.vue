<template lang="pug">
div
    h2 Deck list

    deck-tree-view(:tree='deckDueTree', :indent='0')
</template>

<script>
import { ankiCall } from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import DeckTreeView from './dashboard/DeckTreeView';

export default {
    mixins: [
        asyncData (async _props => {
            const response = await ankiCall('dashboard_deck_tree');
            return {
                deckDueTree: response
            };
        })
    ],
    data () {
        return {
            deckDueTree: []
        };
    },
    components: {
        DeckTreeView
    },
    name: 'dashboard',
};
</script>