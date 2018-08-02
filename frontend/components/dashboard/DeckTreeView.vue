<template lang="pug">
    div
        div(v-for='deck in sortedDeckTree', :key='deck.fullname')
            b-link.deck-row(:to='"/deck/" + encodeURIComponent(deck.fullname)', router-tag='div')
                // Indent
                span.ml-4(v-for='n in indent')

                // Deck name
                span.pl-1.pr-1.mr-1(@click.stop='toggleDeckCollapse(deck)')
                    template(v-if='deck.subDecks.length')
                        icon(v-if='deck.collapsed', name='regular/plus-square', scale=0.7)
                        icon(v-else, name='regular/minus-square', scale=0.7)
                    icon.hidden(v-else, name='plus-square', scale=0.7)
                span {{deck.name}}

                // Deck due
                div.float-right
                        span.newCount {{deck.newCount}}
                        | &nbsp;+&nbsp;
                        span.revCount {{deck.lrnCount + deck.revCount}}
            deck-tree-view(v-if='!deck.collapsed', :tree='deck.subDecks', :indent='indent + 1')
    
</template>

<script>
import { ankiCall } from '../../api';

export default {
    props: ['tree', 'indent'],
    computed: {
        sortedDeckTree () {
            return this.tree.slice().sort((a, b) => {
                return a.name > b.name;
            });
        }
    },
    methods: {
        toggleDeckCollapse (deck) {
            const newCollapsed = !deck.collapsed;
            ankiCall('deck_collapse', {
                deckName: deck.fullname,
                collapse: !newCollapsed,
            }).then(() => {
                deck.collapsed = newCollapsed;
            });
        }
    },
    name: 'deck-tree-view',
};
</script>

<style scoped>
.deck-row:hover {
    background-color: #eee;
}

.hidden {
    visibility: hidden;
}
</style>
