<template lang="pug">

div.browser-view
    table.table.table-sm
        thead(slot='before-content')
            tr
                th(v-for='field in fields', :key='field.key')
                    div.browser-head(@click='issueSortBy(field.key)')
                        | {{ field.label }}
                        .float-right(v-if='enableSort && field.sortable')
                            span.browser-sort(:class='{ enabled: sortBy === field.key && sortOrder === "asc" }') ↑
                            span.browser-sort(:class='{ enabled: sortBy === field.key && sortOrder === "desc" }') ↓

        tbody
            template(v-if='pageCards.length > 0')
                template(v-for='(card, index) in pageCards')
                    tr.item-row(:class='{selected: card.selected}',
                        @click.exact.prevent='selectOnly(index)'
                        @click.shift.exact.prevent='selectSequential(index)'
                        @click.ctrl.exact.prevent='selectAdd(index)'
                    )
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

    .browser-tools
        b-button-group(:class='{enabled: selectedCardList.length > 0}')
            b-button(size='sm', variant='outline-info', v-b-modal.browserChangeDeck) Change deck
            b-button(size='sm', variant='outline-info', v-b-modal.browserChangeModel) Change model
            b-button(size='sm', variant='outline-info', v-b-modal.browserAddTags) Add tag(s)
            b-button(size='sm', variant='outline-info', v-b-modal.browserRemoveTags) Remove tag(s)
            b-button(size='sm', variant='outline-danger') Reset scheduling

    browser-tool-modals(:selected='selectedCardList', @updateView='updateView++', @updateCardIds='$emit("updateCardIds")')

    ul.pagination.justify-content-center(v-if='pageNum > 1')
        li.page-item(:class='{ disabled: page === 1 }')
            a.page-link(v-hotkey='["ctrl+left"]', title='Previous page', @click.prevent='loadPage(page - 1)') &lt;&lt;
        li.page-item(v-for='i in paginationRange', :class='{ active: i === page }')
            a.page-link(@click.prevent='loadPage(i)') {{i}}
        li.page-item(:class='{ disabled: page === pageNum }')
            a.page-link(v-hotkey='["ctrl+right"]', title='Next page', @click.prevent='loadPage(page + 1)') &gt;&gt;

</template>

<script>

import _ from 'lodash';
import { ankiCall } from '../../api/ankiCall';
import BrowserEditor from './BrowserEditor';
import BrowserToolModals from './BrowserToolModals';
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
        BrowserToolModals,
    },
    data () {
        return {
            page: 1,
            updateView: 0,
            lastSelectedIndex: -1,
        };
    },
    watch: {
        pageNum () {
            this.page = Math.max(1, Math.min(this.page, this.pageNum));
        },
        updateView () {
            this.lastSelectedIndex = -1;
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
        selectedCardList () {
            return this.pageCards.filter(c => c.selected).map(x => x.id);
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
            if(sortBy === sortField) {
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
        getFormatter (formatter) {
            if(formatter) return fieldFormatter[formatter];
            else return (x) => x;
        },

        // Selection
        selectOnly (index) {
            const origSelect = this.pageCards[index].selected;
            this.pageCards.forEach(card => {
                card.selected = false;
            });
            this.pageCards[index].selected = !origSelect;
            this.lastSelectedIndex = index;
        },
        selectSequential (index) {
            const {lastSelectedIndex} = this;
            if(lastSelectedIndex === -1) return this.selectOnly(index);
            else {
                if(lastSelectedIndex < index) {
                    for(let i = lastSelectedIndex + 1 ; i <= index ; i++) {
                        this.pageCards[i].selected = true;
                    }
                }
                else {
                    for(let i = lastSelectedIndex - 1 ; i >= index ; i--) {
                        this.pageCards[i].selected = true;
                    }
                }
                this.lastSelectedIndex = index;
            }
        },
        selectAdd (index) {
            const origSelect = this.pageCards[index].selected;
            this.pageCards[index].selected = !origSelect;
            if(!origSelect) this.lastSelectedIndex = index;
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
            user-select: none;
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
    .browser-tools {
        text-align: center;
        position: sticky;
        bottom: 4em;
        .btn-group {
            display: inline-block;
            background-color: white;
            opacity: 0;
            &.enabled {
                opacity: 1;
                pointer-events: initial;
            }
            transition: opacity .3s;
        }
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
