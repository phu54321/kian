<template lang="pug">

div.browser-view
    table.table.table-sm
        thead(slot='before-content')
            tr
                th(v-for='field in fields', :key='field.key')
                    | {{ field.label }}

        browser-view-batch(:cardIds='pageItems', :fields='fields')

    ul.pagination.justify-content-center
        li.page-item(:class='{ disabled: page == 1 }')
            a.page-link(v-hotkey='["ctrl+left"]', @click.prevent='loadPage(page - 1)') &lt;&lt;
        li.page-item(v-for='i in paginationRange', :class='{ active: i == page }')
            a.page-link(@click.prevent='loadPage(i)') {{i}}
        li.page-item(:class='{ disabled: page == pageNum }')
            a.page-link(v-hotkey='["ctrl+right"]', @click.prevent='loadPage(page + 1)') &gt;&gt;

</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import asyncData from '../../utils/asyncData';
import BrowserViewBatch from './BrowserViewBatch';
const _ = require('lodash');

export default {
    props: ['cardIds', 'enableSort'],
    components: {
        BrowserViewBatch
    },
    data () {
        return {
            page: 1,
        };
    },
    computed: {
        pageNum () {
            if(this.cardIds.length === 0) return 0;
            else return ((this.cardIds.length - 1) / 100 | 0) + 1;
        },
        pageItems () {
            return this.cardIds.slice(this.page * 100 - 100, this.page * 100);
        },
        paginationRange () {
            const minPage = Math.max(1, this.page - 5);
            const maxPage = Math.min(this.pageNum, this.page + 5);
            return _.range(minPage, maxPage + 1);
        },
        fields () {
            return [
                { label: 'Preview', key: 'preview', sortable: this.enableSort, formatter: 'textVersionJs', class: 'ellipsis' },
                { label: 'Deck', key: 'deck', sortable: this.enableSort },
                { label: 'Model', key: 'model', sortable: this.enableSort, class: 'ellipsis' },
                { label: '#', key: 'ord' },
                { label: 'Created', key: 'createdAt', sortable: this.enableSort, formatter: 'timeToText' },
                { label: 'Modified', key: 'updatedAt', sortable: this.enableSort, formatter: 'timeToText' },
                { label: 'Due', key: 'due', sortable: this.enableSort, formatter: 'timeToText' },
                { label: 'Tag', key: 'tags', formatter: 'concatTags', class: 'ellipsis' },
            ];
        },
    },
    methods: {
        loadPage (newPage) {
            this.page = newPage;
        }
    }
};

</script>

<style lang="scss" scoped>

.browser-view {
    position: relative;
    .pagination {
        opacity: 0.3;
        transition: opacity .2s;
        &:hover {
            opacity: 1;
        }
        position: sticky;
        top: 50px;
        bottom: 1rem;
    }
}

div /deep/ td {
    font-size: .8em;
    &.ellipsis {
        max-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

</style>
