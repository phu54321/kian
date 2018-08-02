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

    b-button(size='sm' variant='outline-primary', :to='"study/" + encodeURIComponent(deckName)') Study now

</template>

<script>

import {ankiCall} from '../api';

export default {
    props: ['deckName'],
    data () {
        return {
            stats: {},
            due: {},
        };
    },
    created () {
        ankiCall('deck_info', {
            deckName: this.deckName
        }).then(msg => {
            this.due = msg.due;
            this.stat = msg.stat;
        });
    },
    name: 'deck-view',
};
</script>