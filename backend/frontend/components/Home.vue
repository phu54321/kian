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
import { getKian } from '../api';

export default {
    computed: {
        sortedDeckNames () {
            return Object.keys(this.decks).sort();
        }
    },
    data () {
        return {
            decks: {}
        };
    },
    mounted() {
        getKian('deck/due')
            .then(response => {
                console.log('a', response);
                this.decks = response;
            })
            .catch(err => {
                console.log(err);
            });
    },
    name: 'home',
};
</script>