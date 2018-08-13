<template lang="pug">

virtual-scroller.table(:items='cards', item-height='50', container-tag='table', content-tag='tbody')
    thead(slot='before-content')
        tr
            th Deck
            th Card type
            th Front
            th Tags
    template(slot-scope='{item, itemKey}')
        tr(:key='itemKey')
            td {{item.deck}}
            td {{item.model}} \#{{item.ord}}
            td {{textVersionjs(item.front)}}
            td {{item.tags.join(', ')}}

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

.scrollable {
    height: 300px;
}

</style>
