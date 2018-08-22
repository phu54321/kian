<template lang="pug">
tbody
    template(v-if='cards.length > 0')
        tr(v-for='(card, index) in cards', v-if='card', :class='{selected: card.selected}' @click='selectCard(index)')
            td(
                v-for='field in fields',
                :key='field.key',
                :class='field.class')
                | {{ getFormatter(field.formatter)(card[field.key]) }}
    tr(v-else)
        td.nocard(:colspan='fields.length')
            h4
                i.fas.fa-globe-asia
                | &nbsp;Oops, no cards :(
            p Try different query instead.
</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import asyncData from '../../utils/asyncData';
import textVersionJs from 'textVersionjs';
import padLeft from 'pad-left';
import _ from 'lodash';

export default {
    props: ['cardIds', 'fields'],
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
    },
    computed: {
        selectedCardCount() {
            return _.sumBy(this.cards, c => c.selected ? 1 : 0);
        }
    },
    methods: {
        selectCard (index) {
            this.cards.forEach(card => {
                card.selected = false;
            });
            this.cards[index].selected = true;
            console.log(index);
        },
        textVersionJs (text) {
            return textVersionJs(text, {
                imgProcess (src, alt) {
                    return '';
                }
            });
        },
        formatOrd (ord) {
            return `#${ord + 1}`;
        },
        timeToText (timestamp) {
            if (typeof timestamp === 'string') return timestamp
            const date = new Date(timestamp * 1000);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}-${padLeft(month, 2, '0')}-${padLeft(day, 2, '0')}`;
        },
        concatTags (tags) {
            return tags.join(', ');
        },
        getFormatter (formatter) {
            if(formatter) return this[formatter];
            else return (x) => x;
        }

    }
};

</script>

<style lang="scss" scoped>

tbody tr {
    transition: background-color .2s;
    &:hover {
        background-color: #eee;
    }
    &.selected {
        background-color: #afe2c4;
    }
}

.nocard {
    text-align: center;
    padding: 4em;
}
</style>
