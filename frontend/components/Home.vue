<template lang="pug">
    v-container
        v-card
            v-card-title(primary-title)
                .headline Deck list
            v-card-text
                v-list
                    v-list-tile(v-for='deckName in sortedDeckNames', :key='deckName')
                        v-list-tile-content
                            v-list-tile-title(v-text="deckName")
                        v-list-tile-avatar.text-xs-right
                            span.blue--text {{decks[deckName].newCount}}
                            | &nbsp;
                            span.red--text {{decks[deckName].lrnCount + decks[deckName].revCount}}
</template>

<script>
export default {
    computed: {
        sortedDeckNames () {
            return Object.keys(this.decks).sort();
        }
    },
    data () {
        return {
            decks: {
                '1\ud559\ub144': {
                    'lrnCount': 180, 
                    'newCount': 1200, 
                    'revCount': 1019
                }, 
                '1\ud559\ub144::2\ubd84\uae30': {
                    'lrnCount': 3, 
                    'newCount': 1000, 
                    'revCount': 542
                }, 
                '1\ud559\ub144::3\ubd84\uae30': {
                    'lrnCount': 64, 
                    'newCount': 1000, 
                    'revCount': 331
                }, 
                '1\ud559\ub144::4\ubd84\uae30': {
                    'lrnCount': 113, 
                    'newCount': 1200, 
                    'revCount': 146
                }, 
                '1\ud559\ub144::4\ubd84\uae30::\uae30\uc0dd\ucda9\ud559': {
                    'lrnCount': 62, 
                    'newCount': 445, 
                    'revCount': 0
                }, 
                '1\ud559\ub144::4\ubd84\uae30::\uae30\uc885\ud3c9': {
                    'lrnCount': 0, 
                    'newCount': 0, 
                    'revCount': 0
                }, 
                '1\ud559\ub144::4\ubd84\uae30::\ub561\uc2dc': {
                    'lrnCount': 0, 
                    'newCount': 136, 
                    'revCount': 0
                }, 
                '1\ud559\ub144::4\ubd84\uae30::\ubbf8\uc0dd\ubb3c\ud559': {
                    'lrnCount': 24, 
                    'newCount': 709, 
                    'revCount': 0
                }, 
                '1\ud559\ub144::4\ubd84\uae30::\uc784\uc0c1\uba74\uc5ed\ud559': {
                    'lrnCount': 9, 
                    'newCount': 888, 
                    'revCount': 1
                }, 
                '2\ud559\ub144': {
                    'lrnCount': 28, 
                    'newCount': 800, 
                    'revCount': 4
                }, 
                '2\ud559\ub144::2\ud559\ub144_\uc2dc\ud5d8\uce68': {
                    'lrnCount': 27, 
                    'newCount': 800, 
                    'revCount': 1
                }, 
                'Default': {
                    'lrnCount': 0, 
                    'newCount': 0, 
                    'revCount': 10
                }
            },
        };
    },
    name: 'home',
};
</script>