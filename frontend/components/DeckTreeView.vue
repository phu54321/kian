<template lang="pug">
    div
        template(v-for='deck in sortedDeckTree')
            b-link.deck-row(:key='deck.name', :to='"/deck/" + encodeURIComponent(deck.name)', router-tag='div')
                span.ml-4(v-for='n in indent')
                template(v-if='deck.subDecks.length')
                    icon.mr-2(v-if='deck.collapsed', name='regular/plus-square', scale=0.7)
                    icon.mr-2(v-else, name='regular/minus-square', scale=0.7)
                icon.mr-2(v-else, name='minus', scale=0.7)
                span {{deck.name}}
                div.float-right
                        span.new {{deck.newCount}}
                        | &nbsp;
                        span.rev {{deck.lrnCount + deck.revCount}}
            deck-tree-view(:v-if='!deck.collapsed', :tree='deck.subDecks', :indent='indent + 1')
    
</template>

<script>export default {
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

.new {
    color: #33f;
}

.lrn {
    color: orangered;
}

.rev {
    color: #383;
}
</style>
