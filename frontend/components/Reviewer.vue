<template lang="pug">

b-card
    div.text-right
        span(@click="loadCard()")
            icon.mr-2(name="sync")
            span.font-italic Next card (Debug)
    p.card-text
        template(v-if='!flipped')
            .mb-4
                div.userContent.front.card(v-html="makeMediaHtml(card.front)")
            b-button(@click="flipped = !flipped", variant="outline-primary") Show Answer
        template(v-else)
            .mb-4
                div.userContent.back.card(v-html="makeMediaHtml(card.back)")

            template(v-if="ansButtonCount == 2")
                b-button.mr-2(@click="answerCard(1)", size='sm', variant="outline-danger") Again
                b-button.mr-2(@click="answerCard(2)", size='sm', variant="outline-success") Good

            template(v-else-if="ansButtonCount == 3")
                b-button.mr-2(@click="answerCard(1)", size='sm', variant="outline-danger") Again
                b-button.mr-2(@click="answerCard(2)", size='sm', variant="outline-success") Good
                b-button.mr-2(@click="answerCard(3)", size='sm', variant="outline-primary") Easy

            template(v-else-if="ansButtonCount == 4")
                b-button.mr-2(@click="answerCard(1)", size='sm', variant="outline-danger") Again
                b-button.mr-2(@click="answerCard(2)", size='sm', variant="outline-secondary") Hard
                b-button.mr-2(@click="answerCard(2)", size='sm', variant="outline-success") Good
                b-button.mr-2(@click="answerCard(3)", size='sm', variant="outline-primary") Easy

</template>

<script>

import {ankiCall} from '../api';
import $ from 'jquery';

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
        makeMediaHtml (html) {
            const $html = $('<div />', {
                html
            });
            $html.find('img').each(function () {
                const src = $(this).attr('src');
                if(src) $(this).attr('src', 'media/' + src);
            });
            return $html.html();
        },
        loadCard () {
            return ankiCall('reviewer_next_card', {
                deckName: this.deckName
            }).then(msg => {
                this.card = {
                    id: msg.cardId,
                    front: msg.front,
                    back: msg.back
                };
                this.ansButtonCount = 2;
                this.flipped = false;
            });
        },
        answerCard (ease) {
            ankiCall('reviewer_answer_card', {
                cardId: this.card.id,
                ease: ease
            }).then(() => {
                return this.loadCard();
            });
        }
    },
    created () {
        this.loadCard();
    },
    name: 'deck-view',
};

</script>
