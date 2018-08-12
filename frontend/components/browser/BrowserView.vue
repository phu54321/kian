<template lang="pug">

virtual-scroller.table(:items='cardIds', item-height='50', container-tag='table', content-tag='tbody')
    thead(slot='before-content')
        tr
            th Card Id
    template(slot-scope='props')
        tr(:key='props.itemKey')
            td {{props.item}}

</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import asyncData from '../../utils/asyncData';

export default {
    props: ['query'],
    data () {
        return {
            cardIds: []
        };
    },
    mixins: [asyncData(async props => {
        const cardIds = await ankiCall('query_cards', {
            query: props.query
        });
        return {
            cardIds: cardIds.slice(0, 100)
        };
    })],
};

</script>

<style lang="scss" scoped>

.scrollable {
    height: 300px;
}

</style>
