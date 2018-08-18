<template lang="pug">
tr
    template(v-if='card')
        td(
            v-for='field in fields',
            :key='field.key',
            :class='field.class')
            | {{ getFormatter(field.formatter)(card[field.key]) }}
    template(v-else)
        td(:colspan='fields.length') Loading...
</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import asyncData from '../../utils/asyncData';
import textVersionJs from 'textVersionjs';
import padLeft from 'pad-left';

export default {
    props: ['cardId', 'fields'],
    asyncComputed: {
        async card () {
            const cards = await ankiCall('browser_get_batch', { cardIds: [this.cardId] });
            return cards[0];
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
