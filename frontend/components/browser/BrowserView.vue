<template lang="pug">

div.browser-view
    table.table.table-sm.table-bordered
        thead(slot='before-content')
            tr
                th(v-for='field in fields', :key='field.key')
                    div.browser-head(@click='issueSortBy(field.key)')
                        | {{ field.label }}
                        .float-right(v-if='enableSort && field.sortable')
                            span.browser-sort(:class='{ enabled: sortBy == field.key && sortOrder == "asc" }') ↑
                            span.browser-sort(:class='{ enabled: sortBy == field.key && sortOrder == "desc" }') ↓

        tbody
            template(v-if='pageCards.length > 0')
                template(v-for='(card, index) in pageCards')
                    tr.item-row(:class='{selected: card.selected}' @click='selectCard(index)')
                        td(
                            v-for='field in fields',
                            :key='field.key',
                            :class='field.class')
                            | {{ getFormatter(field.formatter)(card[field.key]) }}
                    tr.editor-row(v-if='selectedCardId === card.id')
                        td(:colspan='fields.length')
                            browser-editor(
                                :cardId='selectedCardId'
                                :key='card.id',
                                @updateView='updateView++'
                            )
            tr(v-else)
                td.nocard(:colspan='fields.length')
                    h4
                        i.fas.fa-globe-asia
                        | &nbsp;Oops, no cards :(
                    p Try different query instead.

    ul.pagination.justify-content-center(v-if='pageNum > 1')
        li.page-item(:class='{ disabled: page == 1 }')
            a.page-link(v-hotkey='["ctrl+left"]', title='Previous page', @click.prevent='loadPage(page - 1)') &lt;&lt;
        li.page-item(v-for='i in paginationRange', :class='{ active: i == page }')
            a.page-link(@click.prevent='loadPage(i)') {{i}}
        li.page-item(:class='{ disabled: page == pageNum }')
            a.page-link(v-hotkey='["ctrl+right"]', title='Next page', @click.prevent='loadPage(page + 1)') &gt;&gt;

</template>

<script>

import _ from 'lodash';
import { ankiCall } from '../../api/ankiCall';
import BrowserEditor from './BrowserEditor';
import fieldFormatter from './fieldFormatter';


export default {
    props: {
        cardIds: Array,
        enableSort: Boolean,
        sortBy: {
            type: String,
            default: 'id'
        },
        sortOrder: {
            type: String,
            default: 'desc'
        }
    },
    components: {
        BrowserEditor,
    },
    data () {
        return {
            page: 1,
            updateView: 0,
        };
    },
    watch: {
        pageNum () {
            this.page = Math.max(1, Math.min(this.page, this.pageNum));
        }
    },
    asyncComputed: {
        pageCards: {
            async get () {
                const cards = await ankiCall('browser_get_batch', {
                    cardIds: this.pageItems
                });
                cards.forEach(card => {
                    card.selected = false;
                });
                return cards;
            },
            watch () {
                this.updateView;
            },
            default: []
        },
    },
    computed: {
        fields () {
            return [
                { label: 'Preview', key: 'preview', sortable: this.enableSort, formatter: 'textVersionJs', class: 'ellipsis' },
                { label: 'Deck', key: 'deck', sortable: this.enableSort },
                { label: 'Model', key: 'model', sortable: this.enableSort, class: 'ellipsis' },
                { label: '#', key: 'ord', formatter: 'formatOrd' },
                { label: 'Created', key: 'createdAt', sortable: this.enableSort, formatter: 'timeToText' },
                { label: 'Modified', key: 'updatedAt', sortable: this.enableSort, formatter: 'timeToText' },
                { label: 'Due', key: 'due', sortable: this.enableSort, formatter: 'timeToText' },
                { label: 'Tag', key: 'tags', formatter: 'concatTags', class: 'ellipsis' },
            ];
        },

        // Card selection
        selectedCardCount () {
            return _.sumBy(this.pageCards, c => c.selected ? 1 : 0);
        },
        selectedCardId () {
            if(this.selectedCardCount !== 1) return -1;
            const cardId = this.pageCards.filter(c => c.selected)[0].id;
            return cardId;
        },

        // Pagination
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
    },
    methods: {
        loadPage (newPage) {
            this.page = newPage;
        },
        issueSortBy (sortField) {
            let { sortBy, sortOrder } = this;
            if(sortBy == sortField) {
                sortOrder = {
                    desc: 'asc',
                    asc: 'desc'
                }[sortOrder];
            }
            else {
                sortBy = sortField;
                sortOrder = 'desc';
            }
            this.$emit('update:sortBy', sortBy);
            this.$emit('update:sortOrder', sortOrder);
        },
        selectCard (index) {
            const origSelect = this.pageCards[index].selected;
            this.pageCards.forEach(card => {
                card.selected = false;
            });
            this.pageCards[index].selected = !origSelect;
        },
        getFormatter (formatter) {
            if(formatter) return fieldFormatter[formatter];
            else return (x) => x;
        }
    }
};

</script>

<style lang="scss" scoped>

.browser-view {
    position: relative;
    .browser-head {
        .browser-sort {
            font-weight: bold;
            color: #ccc;
            &.enabled {
                color: #333;
            }
        }
    }

    tbody tr {
        transition: background-color .3s;
        &.item-row {
            font-size: .8em;
            &:hover {
                background-color: #eee;
            }
            &.selected {
                background-color: #afe2c4;
            }
        }
        &.editor-row {
            td {
                height: 0;
                padding: 1em;
            }
        }
        .nocard {
            text-align: center;
            padding: 4em;
        }
    }

    .pagination {
        opacity: 0.5;
        transition: opacity .2s;
        &:hover {
            opacity: 1;
        }
        position: sticky;
        bottom: 1rem;
    }
}


div /deep/ td {
    &.ellipsis {
        max-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

</style>
