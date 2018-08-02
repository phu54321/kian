<template lang="pug">
div
    h2 Deck {{deckName}}

    table
        tr
            td New
            td.newCount {{newCount}}
        tr
            td Learning
            td.lrnCount {{lrnCount}}
        tr
            td Review
            td.revCount {{revCount}}
        tr
            td Mature
            td {{matureCount}}
        tr
            td Young
            td {{youngCount}}

        tr
            td Total
            td {{totalCount}}

    b-button.float-right(size='sm' variant='outline-primary') Study now

</template>

<script>

import { ankiCall } from '../api';

export default {
    props: ['deckName'],
    data () {
        return {
            newCount: 0,
            lrnCount: 0,
            revCount: 0,
            matureCount: 0,
            youngCount: 0,
            totalCount: 0,
        };
    },
    created () {
        ankiCall('deck_info', {
            deckName: this.deckName
        }).then(msg => {
            this.newCount = msg.newCount;
            this.lrnCount = msg.lrnCount;
            this.revCount = msg.revCount;
        });
    },
    name: 'deck-view',
};
</script>