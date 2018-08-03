<template lang="pug">
div
    h2 Deck {{deckName}}

    table.mb-3
        tr
            td New
            td.pl-3.newCount {{due.newCount}}
        tr
            td Learning
            td.pl-3.lrnCount {{due.lrnCount}}
        tr
            td Review
            td.pl-3.revCount {{due.revCount}}
        tr
            td Mature
            td.pl-3 {{stat.mature}}
        tr
            td Young
            td.pl-3 {{stat.young}}

        tr
            td Total
            td.pl-3 {{stat.total}}

    b-button(size='sm' variant='outline-primary', :to='"/study/" + encodeURIComponent(deckName)') Study now

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