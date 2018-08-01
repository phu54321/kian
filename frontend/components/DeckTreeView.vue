<template lang="pug">
    v-list
        div(v-for='deck in sortedDeckTree', :key='deck.name')
            v-list-tile
                v-list-tile-content
                    v-list-tile-title(v-text="deck.name")
                v-list-tile-avatar.text-xs-right
                    span.blue--text {{deck.newCount}}
                    | &nbsp;
                    span.red--text {{deck.lrnCount + deck.revCount}}
            deck-tree-view.ml-4(:tree='deck.subDecks')
    
</template>

<script>
export default {
    props: ['tree'],
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