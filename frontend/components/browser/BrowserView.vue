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
            template(v-if='visibleCards.length > 0')
                template(v-for='(card, index) in visibleCards')
                    tr.item-row(:class='{selected: cardSelected[card.id]}',
                        @click.exact.prevent='selectOnly(index)'
                        @click.shift.exact.prevent='selectSequential(index)'
                        @click.ctrl.exact.prevent='selectAdd(index)'
                        @click.meta.exact.prevent='selectAdd(index)'
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

import ankiCall from '~/api/ankiCall';
import BrowserEditor from './BrowserEditor';
import BrowserToolModals from './BrowserToolModals';
import fieldFormatter from './fieldFormatter';


const cardPerPage = 10;


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
        updateView () {
            this.clearCardCache();
            this.lastSelectedIndex = -1;
        },
        cardIds () {
            this.clearCardCache();
        }
    },
    asyncComputed: {
        visibleCards: {
            async get () {
                const newCardIds = this.visibleItems.filter(x => !this.cardCache[x]);
                const newCards = await ankiCall('browser_get_batch', {
                    cardIds: newCardIds
                });
                let newCardIdx = 0;
                this.visibleItems.forEach(id => {
                    if(!this.cardCache[id]) this.cardCache[id] = newCards[newCardIdx++];
                });
                const cards = this.visibleItems.map(x => this.cardCache[x]);
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
            return this.cardIds.filter(c => this.cardSelected[c]).length;
        },
        selectedCardId () {
            if(this.selectedCardCount !== 1) return -1;
            const cardId = this.cardIds.filter(c => this.cardSelected[c])[0].id;
            return cardId;
        },
        selectedCardList () {
            return this.cardIds.filter(c => this.cardSelected[c]).map(x => x.id);
        },


        // Pagination
        visibleItems () {
            return this.cardIds.slice(this.page * cardPerPage - cardPerPage, this.page * cardPerPage);
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
            if(!!this.cardSelected[cardId] !== selected) this.$set(this.cardSelected, cardId, selected);
        },

        /**
         * selectCardId incurs vue reactivity change for each assignment. To 'not' trigger reactivity multiple times,
         * we need a way to modify multiple card's selectivity in a 'batch' sense. 
         */
        selectCardIdBatch (cardIds, selected) {
            const newObj = Object.assign({}, this.cardSelected);
            for(const id of cardIds) newObj[id] = selected;
            this.cardSelected = newObj;
        },

        selectOnly (index) {
            const newSelectedCardId = this.visibleCards[index].id;
            const origSelect = this.cardSelected[newSelectedCardId];
            this.selectCardIdBatch(this.cardIds, false);
            this.selectCardId(newSelectedCardId, !origSelect);
            this.lastSelectedIndex = index;
        },
        selectSequential (index) {
            const {lastSelectedIndex} = this;
            if(lastSelectedIndex === -1) return this.selectOnly(index);
            else {
                if(lastSelectedIndex < index) {
                    for(let i = lastSelectedIndex + 1 ; i <= index ; i++) {
                        this.selectCardId(this.visibleCards[i].id, true);
                    }
                }
                else {
                    for(let i = lastSelectedIndex - 1 ; i >= index ; i--) {
                        this.selectCardId(this.visibleCards[i].id, true);
                    }
                }
                this.lastSelectedIndex = index;
            }
        },
        selectAdd (index) {
            const origSelect = this.cardSelected[this.visibleCards[index]];
            this.selectCardId(this.visibleCards[index].id, !origSelect);
            if(!origSelect) this.lastSelectedIndex = index;
        },
        selectAll () {
            if(this.cardIds.every(cardId => this.cardSelected[cardId])) {
                this.selectCardIdBatch(this.cardIds, false);
            } else {
                this.selectCardIdBatch(this.cardIds, true);
            }
            this.lastSelectedIndex = this.cardIds.length - 1;
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
