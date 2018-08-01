<template lang="pug">
    div
        div(v-for='deck in sortedDeckTree', :key='deck.name')
            b-link.deck-row(:to='"/deck/" + encodeURIComponent(deck.name)', router-tag='div')
                span.ml-3(v-for='n in indent')
                template(v-if='deck.subDecks.length')
                    icon.mr-2(v-if='deck.collapsed', name='regular/plus-square', scale=0.7)
                    icon.mr-2(v-else, name='regular/minus-square', scale=0.7)
                icon.hidden.mr-2(v-else, name='plus-square', scale=0.7)
                span {{deck.name}}
                div.float-right
                        span.new {{deck.newCount}}
                        | &nbsp;+&nbsp;
                        span.rev {{deck.lrnCount + deck.revCount}}
            deck-tree-view(v-if='!deck.collapsed', :tree='deck.subDecks', :indent='indent + 1')
    
</template>

<script>

import '../../css/learning.scss';

export default {
    props: ['tree', 'indent'],
    computed: {
        sortedDeckTree () {
            return this.tree.slice().sort((a, b) => {
                return a.name > b.name;
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
