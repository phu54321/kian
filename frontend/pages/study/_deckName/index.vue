// Copyright (C) 2018 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

<template lang="pug">

div
    input(type='hidden', :value='card.id')
    span.text-secondary Deck: {{deckName}}
    div.float-right
        .remaining.mr-3
            span.newCount.ml-2 {{remaining.new}}
            span.lrnCount.ml-2 {{remaining.lrn}}
            span.revCount.ml-2 {{remaining.rev}}

        span(v-hotkey="['ESC']", title='Skip this card', @click="loadCard()")
            icon.mr-2(v-b-tooltip.hover, title='Change card (C)', name="sync")
        span(v-hotkey="['e']", title='Edit this card', @click="openEditor()")
            icon(v-b-tooltip.hover, title='Edit current (E)', name='edit')

    p.text-center
        template(v-if='!flipped')
            .mb-4
                shadow-dom.front.card(:html="card.front")
            b-button(v-hotkey="['SPACE']", @click="flipped = !flipped", variant="outline-primary") Show Answer

        template(v-else)
            .mb-4
                shadow-dom.back.card(:html="card.back")
            b-button.mr-2(
                v-for='(button, index) in answerButtons',
                :key='button'
                v-hotkey='(button === "Good") ? ["SPACE", (index + 1).toString()] : [(index + 1).toString()]',
                @click='answerCard(index + 1)',
                size='sm',
                :variant='`outline-${answerButtonColor(button)}`') {{button}}

</template>

<script>

import ankiCall from '~/api/ankiCall';
import ErrorDialog from '~/components/ErrorDialog.vue';
import ShadowDom from '~/components/ShadowDom';

async function getNextCard (deckName) {
    const msg = await ankiCall('reviewer_next_card', { deckName });
    return {
        remaining: msg.remaining,
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
    async asyncData (props) {
        const deckName = props.deckName;
        return getNextCard(deckName);
    },
    data () {
        return {
            card: {},
            flipped: false,
            ansButtonCount: 0,
            note: null,
            remaining: {
                new: 0,
                lrn: 0,
                rev: 0,
            },
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
            this.$router.push(`/card/${this.card.id}`);
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

<style scoped lang='scss'>

.remaining {
    display: inline-block;
    font-size: 1.1em;
    line-height: 1.1em;
    transform: translate(0, .15em);
}

</style>