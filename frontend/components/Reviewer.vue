<template lang="pug">

div
    input(type='hidden', :value='card.id')
    span.text-secondary Deck: {{deckName}}
    div.float-right
        span(v-hotkey="['ESC']", title='Skip this card', @click="loadCard()")
            icon.mr-2(v-b-tooltip.hover, title='Change card (C)', name="sync")
        span(v-hotkey="['e']", title='Edit this card', @click="openEditor()")
            icon(v-b-tooltip.hover, title='Edit current (E)', name='edit')

    p.text-center
        template(v-if='!flipped')
            .mb-4
                shadow-dom.userContent.front.card(:html="card.front")
            b-button(v-hotkey="['SPACE']", click="flipped = !flipped", variant="outline-primary") Show Answer
        template(v-else)
            .mb-4
                shadow-dom.userContent.back.card(:html="card.back")

            b-button.mr-2(
                v-for='(button, index) in answerButtons',
                :key='button'
                v-hotkey='(button == "Good") ? ["SPACE", (index + 1).toString()] : [(index + 1).toString()]',
                @click='answerCard(index + 1)',
                size='sm',
                :variant='`outline-${answerButtonColor(button)}`') {{button}}

</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import ErrorDialog from './ErrorDialog.vue';
import ShadowDom from '../utils/ShadowDom';

async function getNextCard (deckName) {
    const msg = await ankiCall('reviewer_next_card', {deckName});
    return {
        card: {
            id: msg.cardId,
            noteId: msg.noteId,
            front: msg.front,
            back: msg.back
        },
        ansButtonCount: msg.ansButtonCount,
        flipped: false
    };
}

export default {
    props: ['deckName'],
    mixins: [asyncData(async props => {
        const deckName = props.deckName;
        return getNextCard(deckName);
    })],
    data () {
        return {
            card: {},
            flipped: false,
            ansButtonCount: 0,
            note: null
        };
    },
    components: { ShadowDom },
    methods: {
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
        openEditor () {
            this.$router.push({
                name: 'card_edit',
                params: {
                    cardId: this.card.id
                }
            });
        },
        answerCard (ease) {
            ankiCall('reviewer_answer_card', {
                cardId: this.card.id,
                ease: ease
            }).then(() => {
                return getNextCard(this.deckName);
            }).then(card => {
                Object.assign(this.$data, card);
            }).catch(err => {
                ErrorDialog.openErrorDialog(err.message);
            });
        },
        answerButtonColor (type) {
            return {
                Again: 'danger',
                Hard: 'secondary',
                Good: 'success',
                Easy: 'primary',
            }[type];
        },
    },
    computed: {
        answerButtons () {
            return {
                2: ['Again', 'Good'],
                3: ['Again', 'Good', 'Easy'],
                4: ['Again', 'Hard', 'Good', 'Easy']
            }[this.ansButtonCount];
        },
    },
    name: 'deck-view',
};

</script>
