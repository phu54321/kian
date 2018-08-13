<template lang="pug">

table.table.table-sm
    thead
        tr
            th Front
            th Deck
            th Card type
            th Tags
    tbody
        template(v-for='item in cards')
            tr(:key='item.id')
                td
                    .browser-col-preview {{textVersionjs(item.front)}}
                td.browser-col-deck {{item.deck}}
                td.browser-col-model {{item.model}} \#{{item.ord}}
                td.browser-col-tag {{item.tags.join(', ')}}        

</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import asyncData from '../../utils/asyncData';
import textVersionjs from 'textVersionjs';

export default {
    props: ['query'],
    data () {
        return {
            cards: [],
        };
    },
    methods: {
        textVersionjs (text) {
            return textVersionjs(text, {
                imgProcess (src, alt) {
                    return '';
                }
            });
        }
    },
    mixins: [asyncData(async props => {
        let cardIds = await ankiCall('browser_query', { query: props.query });
        cardIds = cardIds.slice(0, 100)
        const cards = await ankiCall('browser_get_batch', {cardIds})
        return {
            cards
        };
    })],
};

</script>

<style lang="scss" scoped>

table {
    td {
        font-size: .8em;
    }
    .browser-col-preview {
        @extend .browser-ellipsis;
        width: 20em;
    }

    .browser-ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

}
</style>
