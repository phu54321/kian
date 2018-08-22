<template lang="pug">
tbody
    template(v-if='cards.length > 0')
        template(v-for='(card, index) in cards')
            tr.item-row(:class='{selected: card.selected}' @click='selectCard(index)')
                td(
                    v-for='field in fields',
                    :key='field.key',
                    :class='field.class')
                    | {{ getFormatter(field.formatter)(card[field.key]) }}
            tr.editor-row(v-if='selectedCard === card.id')
                td(:colspan='fields.length')
                    card-editor(
                        v-if='currentCard',
                        v-model='currentCard',
                        :key='card.id',
                        deck-fixed,
                        model-fixed,
                        @save='onNoteEdit'
                    )
    tr(v-else)
        td.nocard(:colspan='fields.length')
            h4
                i.fas.fa-globe-asia
                | &nbsp;Oops, no cards :(
            p Try different query instead.
</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import CardEditor from '../editor/CardEditor';
import ErrorDialog from '../ErrorDialog';
import _ from 'lodash';
import fieldFormatter from './fieldFormatter';

export default {
    props: ['cardIds', 'fields'],
    components: {
        CardEditor,
        ErrorDialog,
    },
    asyncComputed: {
        cards: {
            async get () {
                const cards = await ankiCall('browser_get_batch', {
                    cardIds: this.cardIds
                });
                cards.forEach(card => {
                    card.selected = false;
                });
                return cards;
            },
            default: []
        },
        currentCard: {
            get () {
                if(this.selectedCardCount !== 1) return null;
                const cardId = this.cards.filter(c => c.selected)[0].id;
                return ankiCall('card_get', { cardId } );
            },
        },
    },
    computed: {
        selectedCardCount () {
            return _.sumBy(this.cards, c => c.selected ? 1 : 0);
        },
        selectedCard () {
            if(this.selectedCardCount !== 1) return -1;
            const cardId = this.cards.filter(c => c.selected)[0].id;
            return cardId;
        }
    },
    methods: {
        selectCard (index) {
            const origSelect = this.cards[index].selected;
            this.cards.forEach(card => {
                card.selected = false;
            });
            this.cards[index].selected = !origSelect;
        },
        onNoteEdit () {
            const card = this.currentCard;
            ankiCall('card_update', {
                cardId: card.id,
                deck: card.deck,
                fields: card.fields,
                tags: card.tags,
            }).then(() => {
                return ankiCall('browser_get_batch', {
                    cardIds: this.cardIds
                });
            }).then((newCards) => {
                const cardIndex = this.cardIds.indexOf(card.id);
                if(cardIndex !== -1) {
                    newCards.forEach(card => {
                        card.selected = false;
                    });
                    this.cards = newCards;
                }
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
            });
        },

        getFormatter (formatter) {
            if(formatter) return fieldFormatter[formatter];
            else return (x) => x;
        }

    }
};

</script>

<style lang="scss" scoped>

tbody tr {
    transition: background-color .3s;
    &.item-row {
        font-size: .8em;
        &:hover {
            background-color: #eee;
        }
        &.selected {
            background-color: #afe2c4;
        }
    }
    &.editor-row {
        td {
            height: 0;
            padding: 1em;
        }
    }
    .nocard {
        text-align: center;
        padding: 4em;
    }
}

</style>
