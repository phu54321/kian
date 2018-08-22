<template lang="pug">
tbody
    template(v-if='cards.length > 0')
        tr(v-for='card in cards', v-if='card', :class='{checked: card.checked || card.selected}')
            td.browser-checkbox
                b-form-checkbox(v-model='card.checked')
            td(
                v-for='field in fields',
                :key='field.key',
                :class='field.class')
                | {{ getFormatter(field.formatter)(card[field.key]) }}
    tr(v-else)
        td.nocard(:colspan='fields.length + 1')
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

export default {
    props: ['cardIds', 'fields'],
    asyncComputed: {
        cards: {
            async get () {
                const cards = await ankiCall('browser_get_batch', {
                    cardIds: this.cardIds
                });
                cards.forEach(card => {
                    card.checked = false;
                    card.collapsed = true;
                });
                return cards;
            },
            default: []
        },
    },
    methods: {
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
    &.checked {
        background-color: #afe2c4;
    }
}

.nocard {
    text-align: center;
    padding: 4em;
}
</style>
