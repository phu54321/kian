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
    span(v-hotkey="'ctrl+a'", title='Select all cards', @click='onSelectAll')

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
            template(v-if='visibleCards.length > 0')
                template(v-for='(card, index) in visibleCards')
                    tr.item-row(:class='{selected: cardSelected[index]}',
                        @click.exact.prevent='selectCardIndexOnly(index)'
                        @click.shift.exact.prevent='onSelectSequential(index)'
                        @click.ctrl.exact.prevent='onSelectAdd(index)'
                        @click.meta.exact.prevent='onSelectAdd(index)'
                    )
                        td(v-for='field in fields', :class='field.class')
                            .item-row-div {{ getFormatter(field.formatter)(card[field.key]) }}
                    tr.editor-row(v-if='selectedCardId === card.id')
                        td(:colspan='fields.length')
                            .editor-row-div
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

</template>

<script>

import _ from 'lodash';
import ankiCall from '~/api/ankiCall';
import BrowserEditor from './BrowserEditor';
import BrowserToolModals from './BrowserToolModals';
import fieldFormatter from './fieldFormatter';


const cardPerPage = 100;


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
            cardCache: [],
            cardSelected: [],
        };
    },
    created () {
        this.resetCardCache();
    },
    watch: {
        updateView () {
            this.resetCardCache();
            this.lastSelectedIndex = -1;
        },
        cardIds () {
            this.resetCardCache();
        }
    },
    asyncComputed: {
        visibleCards: {
            async get () {
                const newCardIndexes = this.visibleIndexes.filter(idx => !this.cardCache[idx]);
                const newCards = await ankiCall('browser_get_batch', {
                    cardIds: newCardIndexes.map(idx => this.cardIds[idx])
                });
                let newCardIdx = 0;
                this.visibleIndexes.forEach(idx => {
                    if(!this.cardCache[idx]) this.cardCache[idx] = newCards[newCardIdx++];
                });
                const cards = this.visibleIndexes.map(idx => this.cardCache[idx]);
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
            return this.cardSelected.filter(x => x).length;
        },
        selectedCardId () {
            if(this.selectedCardCount !== 1) return -1;
            return this.cardIds[this.cardSelected.indexOf(true)];
        },
        selectedCardList () {
            const {cardIds} = this;
            return this.cardSelected
                .map((x, i) => x ? cardIds[i] : null)
                .filter(x => x !== null);
        },

        // Pagination
        visibleIndexes () {
            return _.range(this.page * cardPerPage - cardPerPage, this.page * cardPerPage);
        },
    },
    methods: {
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
        selectCardIndex (cardIndex, selected) {
            this.$set(this.cardSelected, cardIndex, selected);
        },

        selectCardIndexBatch (cardIndexes, selected) {
            for(const idx of cardIndexes) this.selectCardIndex(idx, selected);
        },

        selectCardIndexOnly (index) {
            const origSelect = this.cardSelected[index];
            this.selectAll(false);
            this.selectCardIndex(index, !origSelect);
            this.lastSelectedIndex = index;
        },

        selectAll (selected) {
            this.cardSelected = new Array(this.cardIds.length).fill(selected);
        },

        onSelectSequential (index) {
            const {lastSelectedIndex} = this;
            if(lastSelectedIndex === -1) return this.selectCardIndexOnly(index);
            else {
                if(lastSelectedIndex < index) {
                    for(let i = lastSelectedIndex + 1 ; i <= index ; i++) {
                        this.selectCardIndex(i, true);
                    }
                }
                else {
                    for(let i = lastSelectedIndex - 1 ; i >= index ; i--) {
                        this.selectCardIndex(i, true);
                    }
                }
                this.lastSelectedIndex = index;
            }
        },
        onSelectAdd (index) {
            const origSelect = this.cardSelected[index];
            this.selectCardIndex(index, !origSelect);
            if(!origSelect) this.lastSelectedIndex = index;
        },

        onSelectAll () {
            if(this.cardSelected.every(x => x)) this.selectAll(false);
            else this.selectAll(true);
            this.lastSelectedIndex = this.cardIds.length - 1;
        },

        resetCardCache () {
            this.cardCache = new Array(this.cardIds.length).fill(null);  // Clear cache
            this.cardSelected = new Array(this.cardIds.length).fill(false);
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
            .item-row-div {
                height: 1.5em;
            }
        }
        &.editor-row {
            td {
                height: 0;
                padding: 1em;
                .editor-row-div {
                    height: 40em;
                    overflow-y: auto;
                }
            }
        }
        .nocard {
            text-align: center;
            padding: 4em;
        }
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
        div {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

</style>
