<template lang="pug">

div
    input(type='hidden', :value='card.id')
    div.text-right
        span(@click="loadCard()")
            icon.mr-2(v-b-tooltip.hover, title='Change card', name="sync")
        span(@click="openEditor()")
            icon(v-b-tooltip.hover, title='Edit current', name='edit')

    p.text-center
        template(v-if='!flipped')
            .mb-4
                div.userContent.front.card(v-html="card.front")
            b-button(v-hotkey.up="['Q']", @click="flipped = !flipped", variant="outline-primary") Show Answer
        template(v-else)
            .mb-4
                div.userContent.back.card(v-html="card.back")

            template(v-if="ansButtonCount == 2")
                b-button.mr-2(v-hotkey.up="['1']", @click="answerCard(1)", size='sm', variant="outline-danger") Again
                b-button.mr-2(v-hotkey.up="['2']", @click="answerCard(2)", size='sm', variant="outline-success") Good

            template(v-else-if="ansButtonCount == 3")
                b-button.mr-2(v-hotkey.up="['1']", @click="answerCard(1)", size='sm', variant="outline-danger") Again
                b-button.mr-2(v-hotkey.up="['2']", @click="answerCard(2)", size='sm', variant="outline-success") Good
                b-button.mr-2(v-hotkey.up="['3']", @click="answerCard(3)", size='sm', variant="outline-primary") Easy

            template(v-else-if="ansButtonCount == 4")
                b-button.mr-2(v-hotkey.up="['1']", @click="answerCard(1)", size='sm', variant="outline-danger") Again
                b-button.mr-2(v-hotkey.up="['2']", @click="answerCard(2)", size='sm', variant="outline-secondary") Hard
                b-button.mr-2(v-hotkey.up="['3']", @click="answerCard(3)", size='sm', variant="outline-success") Good
                b-button.mr-2(v-hotkey.up="['4']", @click="answerCard(4)", size='sm', variant="outline-primary") Easy

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
    },
    name: 'deck-view',
};

</script>
