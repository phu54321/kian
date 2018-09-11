// Copyright (C) 2018 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

<template lang="pug">

div.browser-view
    span(v-hotkey="'ctrl+a'", title='Select all cards', @click='selectAll')

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
                    tr.item-row(:class='{selected: cardSelected[card.id]}',
                        @click.exact.prevent='selectOnly(index)'
                        @click.shift.exact.prevent='selectSequential(index)'
                        @click.ctrl.exact.prevent='selectAdd(index)'
                        @click.meta.exact.prevent='selectAdd(index)'
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
        .tools-container(:class='{enabled: selectedCardList.length > 0}')
            b-button-group.mr-2
                b-button(size='sm', variant='info', v-b-tooltip.hover, title='Change deck', v-b-modal.browserChangeDeck)
                    icon.mr-1(name='sync')
                    | D
                b-button(size='sm', variant='info', v-b-tooltip.hover, title='Change model', v-b-modal.browserChangeModel)
                    icon.mr-1(name='sync')
                    | M
                b-button(size='sm', variant='secondary', v-b-tooltip.hover, title='Add tags', v-b-modal.browserAddTags)
                    icon.mr-1(name='plus')
                    | Tag
                b-button(size='sm', variant='secondary', v-b-tooltip.hover, title='Remove tags', v-b-modal.browserRemoveTags)
                    icon.mr-1(name='minus')
                    | Tag

            b-button-group.mr-2
                b-button(size='sm', variant='danger', v-b-tooltip.hover, title='Reset scheduling', v-b-modal.browserResetSched)
                    icon(name='calendar-alt')
                b-button(size='sm', variant='primary', v-b-tooltip.hover, title='Change card due', v-b-modal.browserChangeDue)
                    icon.mr-1(name='sync')
                    icon(name='calendar-alt')

            b-button(size='sm', variant='danger', v-b-tooltip.hover, title='Remove card', v-b-modal.browserRemoveCards)
                icon(name='regular/trash-alt')

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
import ankiCall from '~/api/ankiCall';
import BrowserEditor from './BrowserEditor';
import BrowserToolModals from './BrowserToolModals';
import fieldFormatter from './fieldFormatter';


const cardPerPage = 500;


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
            cardCache: {},
            cardSelected: {},
        };
    },
    watch: {
        pageNum () {
            this.page = Math.max(1, Math.min(this.page, this.pageNum));
        },
        updateView () {
            this.clearCardCache();
            this.lastSelectedIndex = -1;
        },
        cardIds () {
            this.clearCardCache();
        }
    },
    asyncComputed: {
        pageCards: {
            async get () {
                const newCardIds = this.pageItems.filter(x => !this.cardCache[x]);
                const newCards = await ankiCall('browser_get_batch', {
                    cardIds: newCardIds
                });
                let newCardIdx = 0;
                this.pageItems.forEach(id => {
                    if(!this.cardCache[id]) this.cardCache[id] = newCards[newCardIdx++];
                });
                const cards = this.pageItems.map(x => this.cardCache[x]);
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
            return _.sumBy(this.pageCards, c => this.cardSelected[c.id] ? 1 : 0);
        },
        selectedCardId () {
            if(this.selectedCardCount !== 1) return -1;
            const cardId = this.pageCards.filter(c => this.cardSelected[c.id])[0].id;
            return cardId;
        },
        selectedCardList () {
            return this.pageCards.filter(c => this.cardSelected[c.id]).map(x => x.id);
        },


        // Pagination
        pageNum () {
            if(this.cardIds.length === 0) return 0;
            else return ((this.cardIds.length - 1) / cardPerPage | 0) + 1;
        },
        pageItems () {
            return this.cardIds.slice(this.page * cardPerPage - cardPerPage, this.page * cardPerPage);
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
        selectCardId (cardId, selected) {
            this.$set(this.cardSelected, cardId, selected);
        },

        selectOnly (index) {
            const newSelectedCardId = this.pageCards[index].id;
            const origSelect = this.cardSelected[newSelectedCardId];
            this.pageCards.forEach(card => {
                this.selectCardId(card.id, false);
            });
            this.selectCardId(newSelectedCardId, !origSelect);
            this.lastSelectedIndex = index;
        },
        selectSequential (index) {
            const {lastSelectedIndex} = this;
            if(lastSelectedIndex === -1) return this.selectOnly(index);
            else {
                if(lastSelectedIndex < index) {
                    for(let i = lastSelectedIndex + 1 ; i <= index ; i++) {
                        this.selectCardId(this.pageCards[i].id, true);
                    }
                }
                else {
                    for(let i = lastSelectedIndex - 1 ; i >= index ; i--) {
                        this.selectCardId(this.pageCards[i].id, true);
                    }
                }
                this.lastSelectedIndex = index;
            }
        },
        selectAdd (index) {
            const origSelect = this.cardSelected[this.pageCards[index]];
            this.selectCardId(this.pageCards[index].id, !origSelect);
            if(!origSelect) this.lastSelectedIndex = index;
        },
        selectAll () {
            if(this.pageCards.every(card => this.cardSelected[card.id])) {
                this.pageCards.forEach(card => this.selectCardId(card.id, false));  // Deselect all
            } else {
                this.pageCards.forEach(card => this.selectCardId(card.id, true));
            }
            this.lastSelectedIndex = this.pageCards.length - 1;
        },

        clearCardCache () {
            this.cardCache = {};  // Clear cache
            this.cardSelected = {};
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
        .tools-container {
            display: inline-block;
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
