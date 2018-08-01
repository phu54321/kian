<template lang="pug">
    b-list-group
        template(v-for='deck in sortedDeckTree')
            b-list-group-item(:key='deck.name')
                | {{deck.name}}
                div.float-right
                        span.new {{deck.newCount}}
                        | &nbsp;
                        span.rev {{deck.lrnCount + deck.revCount}}
            deck-tree-view.ml-3(:tree='deck.subDecks', :indent='indent + 1')
    
</template>

<script>
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
