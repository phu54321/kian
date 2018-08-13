<template lang="pug">
div
    h2 Deck {{deckName}}

    table.mb-3
        tr
            th New
            td.newCount {{due.newCount}}
        tr
            th Learning
            td.lrnCount {{due.lrnCount}}
        tr
            th Review
            td.revCount {{due.revCount}}
        tr
            th Mature
            td.text-secondary {{stat.mature}}
        tr
            th Young
            td.text-secondary {{stat.young}}

        tr
            th Total
            td.text-secondary {{stat.total}}

    b-button(size='sm', v-hotkey="['space', 'enter']", variant='outline-primary', :to='"/study/" + encodeURIComponent(deckName)') Study now

</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';

export default {
    props: ['deckName'],
    mixins: [
        asyncData(async props => {
            return ankiCall('deck_info', { deckName: props.deckName });
        })
    ],
    data () {
        return {
            stat: {},
            due: {},
        };
    },
    name: 'deck-view',
};
</script>

<style lang="scss" scoped>

table {
    th {
        padding-right: 1em;
    }
}
</style>
