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
            template(v-for='command in displayCommands')
                template(v-if='command.type === "card"')
                    tr.item-row(:class='{selected: cardSelected[command.index]}',
                        @click.exact.prevent='selectCardIndexOnly(command.index)'
                        @click.shift.exact.prevent='onSelectSequential(command.index)'
                        @click.ctrl.exact.prevent='onSelectAdd(command.index)'
                        @click.meta.exact.prevent='onSelectAdd(command.index)'
                    )
                        td(v-for='field in fields', :class='field.class')
                            | {{ getFormatter(field.formatter)(command.card[field.key]) }}
                    tr.editor-row(v-if='selectedCardId === command.card.id')
                        td(:colspan='fields.length')
                            .editor-row-div
                                browser-editor(
                                    :cardId='selectedCardId'
                                    :key='command.card.id',
                                    @updateView='updateView++'
                                )

                template(v-else-if='command.type === "space"')
                    tr
                        td(:colspan='fields.length', :style='{height: 30 * command.length + "px"}')

                template(v-else-if='command.type === "noCards"')
                    tr
                        td.no-card(:colspan='fields.length')
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
import $ from 'jquery';
import ankiCall from '~/api/ankiCall';
import BrowserEditor from './BrowserEditor';
import BrowserToolModals from './BrowserToolModals';
import fieldFormatter from './fieldFormatter';
import BrowserSelection from './BrowserSelection';


export default {
    mixins: [BrowserSelection],
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
            visibleMinIndex: 0,
            visibleMaxIndex: 100,
        };
    },
    created () {
        this.resetCardCache();
        window.addEventListener('scroll', this.onScroll);
    },
    destroyed () {
        window.removeEventListener('scroll', this.onScroll);
    },
    watch: {
        updateView () {
            this.resetCardCache();
        },
    },
    asyncComputed: {
        displayCommands: {
            async get () {
                const {cardIds, cardCache} = this;

                if(cardIds.length === 0) return [{type: 'noCards'}];

                const isCardVisible = (cardId, index) => {
                    if(cardId === this.selectedCardId) return true;
                    if(index < this.visibleMinIndex) return false;
                    if(index > this.visibleMaxIndex) return false;
                    return true;
                };

                const visibleIndexes = _.range(cardIds.length).filter(isCardVisible);
                await this.ensureCardRendered(visibleIndexes);

                let renderCommands = cardIds.map((cid, index) => {
                    if(!isCardVisible(cid, index)) return {
                        type: 'space',
                        length: 1
                    };
                    else return {
                        type: 'card',
                        index,
                        card: cardCache[index]
                    };
                });

                // merge spaces
                renderCommands = renderCommands.reduce((list, entry) => {
                    const lastEntry = list[list.length - 1];
                    if(lastEntry.type === 'space' && entry.type === 'space') {
                        lastEntry.length++;
                    } else {
                        list.push(entry);
                    }
                    return list;
                }, [{ type: 'space', length: 0}]);

                if(
                    renderCommands[0].type === 'space' &&
                    renderCommands[0].length === 0
                ) renderCommands.splice(0, 1);

                return renderCommands.filter(x => x);
            },
            default: [{ type: 'loading' }],
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
    },
    methods: {
        onScroll: _.throttle(function () {
            const {top} = this.$el.getBoundingClientRect();
            const viewportHeight = document.documentElement.clientHeight;
            const PADDING = 30;
            this.visibleMinIndex = ((-top) / 30 - PADDING) | 0;
            this.visibleMaxIndex = ((viewportHeight - top) / 30 + PADDING) | 0;
        }, 250),
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

        resetCardCache () {
            this.cardCache = [];
        },

        async ensureCardRendered (cardIndexes) {
            const {cardIds, cardCache} = this;
            const renderRequests = cardIndexes.filter(idx => !cardCache[idx]);
            const renderedRows = await ankiCall('browser_get_batch', {
                cardIds: renderRequests.map(idx => cardIds[idx])
            });

            // cardCache is just a cache, so it doesn't need to be reactive
            // so we just use plain assignment instead of using this.$set
            renderRequests.forEach((idx, i) => cardCache[idx] = renderedRows[i]);
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
            height: 30px;
        }
        &.editor-row {
            td {
                height: 600px;
                padding: 1em;
                .editor-row-div {
                    height: 550px;
                    overflow-y: auto;
                }
            }
        }
        .no-card {
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

</style>
