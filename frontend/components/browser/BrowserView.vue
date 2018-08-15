<template lang="pug">

div
    b-table(
        small, hover,
        :items='cards', :fields='fields')

</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import asyncData from '../../utils/asyncData';
import textVersionJs from 'textVersionjs';
import padLeft from 'pad-left';

export default {
    props: ['query'],
    data () {
        return {
            sortBy: 'createdAt',
            sortDesc: false,
            cards: [],
        };
    },
    computed: {
        fields: () => [
            { label: 'Preview', key: 'preview', sortable: true, formatter: 'textVersionJs', class: 'ellipsis' },
            { label: 'Deck', key: 'deck', sortable: true },
            { label: 'Model', key: 'model', sortable: true },
            { label: '#', key: 'ord' },
            { label: 'Created', key: 'createdAt', sortable: true, formatter: 'timeToText' },
            { label: 'Modified', key: 'updatedAt', sortable: true, formatter: 'timeToText' },
            { label: 'Due', key: 'due', sortable: true, formatter: 'timeToText' },
            { label: 'Type', key: 'type', sortable: true},
            { label: 'Queue', key: 'queue', sortable: true},
            { label: 'Tag', key: 'tags', formatter: 'concatTags', class: 'ellipsis' },
        ],
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
    },
    mixins: [asyncData(async props => {
        let cardIds = await ankiCall('browser_query', {
            query: props.query,
            sortBy: 'due',
        });
        cardIds = cardIds.slice(0, 100)
        const cards = await ankiCall('browser_get_batch', { cardIds });
        return {
            cards
        };
    })],
};

</script>

<style lang="scss" scoped>

div /deep/ td {
    font-size: .8em;
    &.ellipsis {
        max-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

</style>
