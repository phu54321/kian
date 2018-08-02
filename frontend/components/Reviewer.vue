<template lang="pug">

b-card
    span.float-right(@click="loadCard()")
        icon.mr-2(name="sync")
        span.font-italic Next card (Debug)
    p.card-text
        template(v-if='!flipped')
            div.front.mb-4(v-html="card.front")
            b-button(@click="flipped = !flipped", variant="outline-primary") Show Answer
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