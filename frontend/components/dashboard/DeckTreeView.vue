<template lang="pug">
    div
        div(v-for='deck in sortedDeckTree', :key='deck.fullname')
            b-link(:to='"/deck/" + encodeURIComponent(deck.fullname)', router-tag='div')
                // Indent
                div.deck-row(:style='{"margin-left": (2 * indent) + "em"}')
                    // Deck name
                    span.pl-2.pr-2.mr-2(@click.stop='toggleDeckCollapse(deck)')
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
import { ankiCall } from '../../api/ankiCall';

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

<style scoped lang='scss'>

.deck-row {
    border-bottom: .5px solid #ddd;
    padding: .5em;
    &:hover {
        background-color: #eee;
    }
}

.hidden {
    visibility: hidden;
}
</style>
