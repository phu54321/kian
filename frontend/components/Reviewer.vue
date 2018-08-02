<template lang="pug">

b-card
    p.card-text
        template(v-if='!flipped')
            div.front(v-html="card.front")
            b-button(@click="flipped = !flipped") Show Answer
        template(v-else)
            div.back(v-html="card.back")

</template>

<script>

import {ankiCall} from '../api';

export default {
    props: ['deckName'],
    data () {
        return {
            card: {},
            flipped: false,
            ansButtonCount: 0,
        };
    },
    methods: {
        loadCard () {
            ankiCall('reviewer_next_card', {
                deckName: this.deckName
            }).then(msg => {
                this.card = {
                    front: msg.front,
                    back: msg.back
                };
                this.ansButtonCount = 2;
                this.flipped = false;
            });
        }
    },
    created () {
        this.loadCard();
    },
    name: 'deck-view',
};

</script>