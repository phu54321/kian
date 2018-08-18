<template lang="pug">

div
    table.table.table-sm
        thead(slot='before-content')
            tr
                th(v-for='field in fields', :key='field.key')
                    | {{ field.label }}
        tbody
            browser-view-row(v-for='cardId in cardIds', :key='cardId', :cardId='cardId', :fields='fields')

</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import asyncData from '../../utils/asyncData';
import BrowserViewRow from './BrowserViewRow';

export default {
    props: ['cardIds'],
    components: {
        BrowserViewRow
    },
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
            { label: 'Model', key: 'model', sortable: true, class: 'ellipsis' },
            { label: '#', key: 'ord' },
            { label: 'Created', key: 'createdAt', sortable: true, formatter: 'timeToText' },
            { label: 'Modified', key: 'updatedAt', sortable: true, formatter: 'timeToText' },
            { label: 'Due', key: 'due', sortable: true, formatter: 'timeToText' },
            { label: 'Tag', key: 'tags', formatter: 'concatTags', class: 'ellipsis' },
        ],
    },
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

.list {
    height: 300px;
}

</style>
