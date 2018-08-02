<template lang="pug">
div
    h2 Deck {{deckName}}

    table.mb-3
        tr
            td New
            td.pl-3.newCount {{stats.newCount}}
        tr
            td Learning
            td.pl-3.lrnCount {{stats.lrnCount}}
        tr
            td Review
            td.pl-3.revCount {{stats.revCount}}
        tr
            td Mature
            td.pl-3 {{stats.matureCount}}
        tr
            td Young
            td.pl-3 {{stats.youngCount}}

        tr
            td Total
            td.pl-3 {{stats.totalCount}}

    b-button(size='sm' variant='outline-primary', :to='"study/" + encodeURIComponent(deckName)') Study now

</template>

<script>

import { ankiCall } from '../api';

export default {
    props: ['deckName'],
    data () {
        return {
            stats: {}
        };
    },
    created () {
        ankiCall('deck_info', {
            deckName: this.deckName
        }).then(msg => {
            this.stats = msg.stats;

        });
    },
    name: 'deck-view',
};
</script>