<template lang="pug">

table.table.table-sm
    thead
        tr
            th Front
            th Deck
            th Model
            th #
            th Created
            th Updated
            th Due
            th Tags
    tbody
        template(v-for='item in cards')
            tr(:key='item.id')
                td
                    .browser-col-preview {{textVersionjs(item.front)}}
                td
                    div {{item.deck}}
                td
                    .browser-col-model {{item.model}}
                td
                    div {{item.ord + 1}}
                td
                    div {{timeToText(item.createdAt)}}
                td
                    div {{timeToText(item.updatedAt)}}
                td
                    div {{timeToText(item.due)}}
                td
                    div {{item.tags.join(', ')}}

</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import asyncData from '../../utils/asyncData';
import textVersionjs from 'textVersionjs';
import padLeft from 'pad-left';

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
        },
        timeToText (timestamp) {
            const date = new Date(timestamp * 1000);
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            return `${year}-${padLeft(month, 2, '0')}-${padLeft(day, 2, '0')}`;
        },
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

.browser-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

table {
    td {
        font-size: .8em;
        div {
            @extend .browser-ellipsis;
        }
    }

    .browser-col-preview {
        @extend .browser-ellipsis;
    }

    .browser-col-model {
        @extend .browser-ellipsis;
    }

    .browser-col-tags {
        @extend .browser-ellipsis;
    }
}
</style>
