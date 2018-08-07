<template lang="pug">

div
    input(type='hidden', :value='card.id')
    span.text-secondary Deck: {{deckName}}
    div.text-right
        span(v-hotkey.up="['c']", @click="loadCard()")
            icon.mr-2(v-b-tooltip.hover, title='Change card (C)', name="sync")
        span(v-hotkey.up="['e']", @click="openEditor()")
            icon(v-b-tooltip.hover, title='Edit current (E)', name='edit')

    p.text-center
        template(v-if='!flipped')
            .mb-4
                div.userContent.front.card(v-html="card.front")
            b-button(v-hotkey.up.click="['SPACE']", @click="flipped = !flipped", variant="outline-primary") Show Answer
        template(v-else)
            .mb-4
                div.userContent.back.card(v-html="card.back")

            b-button.mr-2(
                v-for='(button, index) in answerButtons',
                :key='button'
                v-hotkey.up='(button == "Good") ? ["SPACE", (index + 1).toString()] : [(index + 1).toString()]',
                @click='answerCard(index + 1)',
                size='sm',
                :variant='`outline-${answerButtonColor(button)}`') {{button}}

</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import NoteEditor from './NoteEditor';
import ErrorDialog from './ErrorDialog.vue';
import ErrorDialogVue from './ErrorDialog.vue';

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
    components: { NoteEditor },
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
            ankiCall('nid_from_cid', {
                cardId: this.card.id
            }).then(noteId => {
                this.$router.push({
                    name: 'edit',
                    params: {
                        noteId
                    }
                });
            }).catch(err => {
                ErrorDialogVue.openErrorDialog('Cannot open editor window:\n', err.message);
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
