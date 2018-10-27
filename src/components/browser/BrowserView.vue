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
    table.table.table-sm(ref='mainTable')
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
                    tr.item-row(:class='computeRowClass(command)',
                        :key='command.index'
                        @click.exact.prevent='selectCardIndexOnly(command.index)'
                        @click.shift.exact.prevent='onSelectSequential(command.index)'
                        @click.ctrl.exact.prevent='onSelectAdd(command.index)'
                        @click.meta.exact.prevent='onSelectAdd(command.index)'
                    )
                        td(v-for='field in fields', :class='field.class')
                            span(v-html='getFormatter(field.formatter)(command.card[field.key])')

                template(v-else-if='command.type === "space"')
                    tr.spacer-row(:key='command.index')
                        td(:colspan='fields.length', :style='{height: 30 * command.length + "px"}')

                template(v-else-if='command.type === "noCards"')
                    tr
                        td.no-card(:colspan='fields.length')
                            h4
                                i.fas.fa-globe-asia
                                | &nbsp;Oops, no cards :(
                            p Try different query instead.

                template(v-else-if='command.type === "loading"')
                    tr
                        td.no-card(:colspan='fields.length')
                            h4
                                i.fas.fa-hourglass-half
                                | &nbsp;Loading...

    .editor-spacer(
        v-if='showEditor',
        :style='{height: browserEditorHeight + "px"}'
    )
    .editor-row(
        v-if='showEditor',
        :style='{height: browserEditorHeight + "px"}',
        :class='{fullscreen: editorFullscreen}'
    )
        .drag-handle(
            @mousedown='onDragStart',
            @dblclick='toggleEditorFullscreen',
            @click='editorFullscreen && toggleEditorFullscreen()',
            title='Double click to toggle fullscreen'
        )
        .editor-div
            browser-editor(
                :cardId='selectedCardId',
                @updateCardIds='updateCardIds',
                @updateView='updateView++',
            )

    .browser-tools
        .tools-container(:class='{enabled: selectedCardList.length > 0}')
            b-button-group.mr-2
                b-button(size='sm', variant='info', v-b-tooltip.hover, title='Change deck', @click='showBrowserTool("browserChangeDeck")')
                    icon.mr-1(name='sync')
                    | D
                b-button(size='sm', variant='info', v-b-tooltip.hover, title='Change model', @click='showBrowserTool("browserChangeModel")')
                    icon.mr-1(name='sync')
                    | M
                b-button(size='sm', variant='secondary', v-b-tooltip.hover, title='Add tags', @click='showBrowserTool("browserAddTags")')
                    icon.mr-1(name='plus')
                    | T
                b-button(size='sm', variant='secondary', v-b-tooltip.hover, title='Remove tags', @click='showBrowserTool("browserRemoveTags")')
                    icon.mr-1(name='minus')
                    | T

            b-button-group.mr-2
                b-button(size='sm', variant='danger', v-hotkey=['ctrl+k'], v-b-tooltip.hover, title='Mark', @click='markCards')
                    icon(name='star')
                b-button(size='sm', variant='warning', v-hotkey=['ctrl+j'], v-b-tooltip.hover, title='Suspend', @click='suspendCards')
                    icon.text-white(name='pause')

            b-button-group.mr-2
                b-button(size='sm', variant='danger', v-b-tooltip.hover, title='Reset scheduling', @click='showBrowserTool("browserResetSched")')
                    icon(name='calendar-alt')
                b-button(size='sm', variant='primary', v-b-tooltip.hover, title='Change card due', @click='showBrowserTool("browserChangeDue")')
                    icon.mr-1(name='sync')
                    icon(name='calendar-alt')

            b-button(size='sm', variant='danger', v-b-tooltip.hover, title='Remove card', @click='showBrowserTool("browserRemoveCards")')
                icon(name='regular/trash-alt')
        .editor-spacer(v-if='showEditor', :style='{height: (browserEditorHeight - 50) + "px"}')

    browser-tool-modals(:selected='selectedCardList', @updateView='updateView++', @updateCardIds='updateCardIds')

</template>

<script>
import _ from 'lodash'
import $ from 'jquery'

import BrowserEditor from './BrowserEditor'
import BrowserToolModals from './BrowserToolModals'
import fieldFormatter from './fieldFormatter'
import BrowserSelection from './BrowserSelection'
import { clamp } from '@/utils/utils'

import {
  getCardsBrowserInfo,
  toggleCardMarked,
  toggleCardSuspended
} from '@/api'

function isDescendant (parent, child) {
  if (!child) return false

  let node = child.parentNode
  while (node) {
    if (node === parent) {
      return true
    }
    node = node.parentNode
  }
  return false
}

function isInModal (child) {
  if (!child) return false

  for (let node = child; node; node = node.parentNode) {
    const { classList } = node
    if (classList && classList.contains('modal') && classList.contains('show')) return true
  }
  return false
}

export default {
  mixins: [BrowserSelection],
  props: {
    cardIds: [Array, null],
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
    BrowserToolModals
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
      renderRangeBegin: 0,
      renderRangeEnd: 0,
      prerenderRangeBegin: 0,
      prerenderRangeEnd: 0,

      isRendering: false,

      showEditor: false,
      browserEditorHeight: (this.$localStorage.get('browserEditorHeight') || 350) | 0,
      oldPageY: null,
      editorFullscreen: false
    }
  },
  created () {
    this.resetCardCache()
    $('.app-body').on('scroll', this.onScroll)
    window.addEventListener('click', this.clickBlurHandler, true)
  },
  destroyed () {
    window.removeEventListener('click', this.clickBlurHandler)
    $('.app-body').off('scroll', this.onScroll)
  },
  watch: {
    cardIds () {
      this.resetCardCache()
      this.resetSelectedCards()
    },
    updateView () {
      this.resetCardCache()
    },
    visibleRangeWatcher () {
      if (!this.isRendering) {
        this.renderRangeBegin = clamp(this.visibleMinIndex, 0, this.frozenCardIds.length)
        this.renderRangeEnd = clamp(this.visibleMaxIndex, 0, this.frozenCardIds.length)
      }
    },
    prerenderRange (r) {
      this.ensureCardRendered(r)
    },
    selectedCardId (v) {
      if (v !== -1) {
        this.showEditor = true
      } else {
        this.showEditor = false
      }
    }
  },
  asyncComputed: {
    displayCommands: {
      async get () {
        if (this.cardIds === null) return [{ type: 'loading' }]

        const { frozenCardIds: cardIds, cardCache, cardSelected, renderRangeBegin, renderRangeEnd, selectedCardIndex } = this
        if (cardIds.length === 0) return [{ type: 'noCards' }]

        // Prevent parallel ajax (ensureCardsRendered) call. Ajax call can only be initiated
        // after a rendering session completes.
        this.isRendering = true

        const renderIndexes = _.range(renderRangeBegin, renderRangeEnd)
        if (selectedCardIndex !== -1) renderIndexes.push(selectedCardIndex)
        await this.ensureCardRendered(renderIndexes)

        // Build basic render commands
        const renderCommands = new Array(cardIds.length).fill(null)
        const addIndexToRenderCommand = (index) => {
          // We store each cards' selection state in displayCommand, rather than
          // accessing this.cardSelected inside computeRowClass. That is because,
          // accessing `cardSelected` takes quite a time (~10ms), and computing
          // each card's selected state for each commands takes quite long, since
          // evaluation `this.cardSelected` for each card commands trigger a reactive
          // getter of it.
          renderCommands[index] = {
            type: 'card',
            index,
            card: cardCache[index],
            selected: cardSelected[index]
          }
        }

        _.range(renderRangeBegin, renderRangeEnd).forEach(i => addIndexToRenderCommand(i))
        if (selectedCardIndex !== -1) addIndexToRenderCommand(selectedCardIndex)

        // Nulls → space entry
        const compressedRenderCommands = renderCommands.reduce((list, entry) => {
          const lastEntry = list[list.length - 1]
          if (lastEntry.type === 'space' && entry === null) {
            lastEntry.length++
          } else if (entry === null) { // null → space element
            list.push({
              type: 'space',
              length: 1
            })
          } else {
            list.push(entry)
          }
          return list
        }, [{ type: 'space', length: 0 }])

        const firstCommand = compressedRenderCommands[0]
        if (firstCommand.type === 'space' && firstCommand.length === 0) {
          compressedRenderCommands.splice(0, 1)
        }

        this.isRendering = false

        // Prerender some items below/over the table.
        // These items don't need to be rendered right now, but they may be needed after scrolling.
        // Return the currently rendered rows and pend the prerender task to watch() tags.
        const PRERENDER_PADDING = 500
        this.prerenderRangeBegin = this.renderRangeBegin - PRERENDER_PADDING
        this.prerenderRangeEnd = this.renderRangeEnd + PRERENDER_PADDING

        return Object.freeze(compressedRenderCommands.filter(x => x))
      },
      default: [{ type: 'loading' }]
    }
  },
  computed: {
    frozenCardIds () {
      if (this.cardIds === null) return []
      return Object.freeze(this.cardIds.slice())
    },
    fields () {
      return [
        { label: '', key: 'schedType', class: 'pr-1', formatter: 'schedTypeToDot' },
        { label: 'Preview', key: 'preview', sortable: this.enableSort, class: 'ellipsis' },
        { label: 'Deck', key: 'deck', sortable: this.enableSort },
        { label: 'Model', key: 'model', sortable: this.enableSort, class: 'ellipsis' },
        { label: '#', key: 'ord', formatter: 'formatOrd' },
        { label: 'Created', key: 'createdAt', sortable: this.enableSort, formatter: 'timeToText' },
        { label: 'Modified', key: 'updatedAt', sortable: this.enableSort, formatter: 'timeToText' },
        { label: 'Due', key: 'due', sortable: this.enableSort, formatter: 'timeToText' },
        { label: 'Tag', key: 'tags', formatter: 'concatTags', class: 'ellipsis' }
      ]
    },
    visibleRangeWatcher () {
      return [
        this.visibleMinIndex,
        this.visibleMaxIndex,
        this.isRendering
      ]
    },
    prerenderRange () {
      return _.range(this.prerenderRangeBegin, this.prerenderRangeEnd)
    }
  },
  methods: {
    showBrowserTool (modalID) {
      this.showEditor = false
      this.$root.$emit('bv::show::modal', modalID)
    },

    onScroll: _.throttle(function () {
      if (!this.$refs.mainTable) return

      const { top } = this.$refs.mainTable.getBoundingClientRect()
      const viewportHeight = document.documentElement.clientHeight
      const PADDING = 100
      this.visibleMinIndex = ((-top) / 30 - PADDING) | 0
      this.visibleMaxIndex = ((viewportHeight - top) / 30 + PADDING) | 0
    }, 100),

    clickBlurHandler (e) {
      if (!isDescendant(this.$el, e.target) && !isInModal(e.target)) {
        this.selectAll(false)
      }
    },

    issueSortBy (sortField) {
      let { sortBy, sortOrder } = this
      if (sortBy === sortField) {
        sortOrder = {
          desc: 'asc',
          asc: 'desc'
        }[sortOrder]
      } else {
        sortBy = sortField
        sortOrder = 'desc'
      }
      this.$emit('update:sortBy', sortBy)
      this.$emit('update:sortOrder', sortOrder)
    },

    computeRowClass (command) {
      return {
        selected: command.selected,
        marked: command.card.tags.indexOf('marked') !== -1,
        suspended: command.card.suspended
      }
    },

    getFormatter (formatter) {
      if (formatter) return fieldFormatter[formatter]
      else return (x) => x
    },

    resetCardCache () {
      this.cardCache = []
    },

    async ensureCardRendered (cardIndexes) {
      const { frozenCardIds: cardIds, cardCache } = this
      const renderRequests = cardIndexes.filter(idx => (
        idx >= 0 && idx < cardIds.length &&
                !cardCache[idx]
      ))
      if (renderRequests.length === 0) return
      const renderedRows = await getCardsBrowserInfo(renderRequests.map(idx => cardIds[idx]))

      // cardCache is just a cache, so it doesn't need to be reactive
      // so we just use plain assignment instead of using this.$set
      renderRequests.forEach(function (idx, i) {
        cardCache[idx] = renderedRows[i]
      })
    },

    updateCardIds () {
      this.resetCardCache()
      this.resetSelectedCards()
      this.$emit('updateCardIds')
    },

    async markCards () {
      this.showEditor = false
      await this.$nextTick()
      await toggleCardMarked(this.selectedCardList)
      this.updateView++
    },

    async suspendCards () {
      this.showEditor = false
      await this.$nextTick()
      await toggleCardSuspended(this.selectedCardList)
      this.updateView++
    },

    onDragStart (ev) {
      document.addEventListener('mousemove', this.onDragMove, false)
      document.addEventListener('mouseup', this.onDragEnd, false)
      this.oldPageY = ev.pageY
    },
    onDragMove (ev) {
      const yMovement = ev.pageY - this.oldPageY
      this.browserEditorHeight -= yMovement
      if (this.browserEditorHeight < 100) this.browserEditorHeight = 100
      else if (this.browserEditorHeight > 800) this.browserEditorHeight = 800
      this.$localStorage.set('browserEditorHeight', this.browserEditorHeight, { expires: '10Y' })
      this.oldPageY = ev.pageY
    },
    onDragEnd () {
      document.removeEventListener('mousemove', this.onDragMove, false)
      document.removeEventListener('mouseup', this.onDragEnd, false)
    },

    toggleEditorFullscreen () {
      this.editorFullscreen = !this.editorFullscreen
    }
  }
}
</script>

<style lang="scss" scoped>

$color-row-hovered: #eee;
$color-row-marked: #fdd8d8;
$color-row-suspended: #fffc9f;
$color-row-selected: rgba(175, 226, 196, .5);

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

    table {
        tbody tr {
            transition: background-color .3s;
            &.item-row {
                user-select: none;
                font-size: .8em;

                &:hover { background-color: $color-row-hovered; }
                &.marked { background-color: $color-row-marked; }
                &.suspended { background-color: $color-row-suspended; }
                &.selected td { background-color: $color-row-selected; }
                height: 30px;
            }
            &.spacer-row {
                background:
                    linear-gradient(90deg, #fff 16px, transparent 1%) center,
                    linear-gradient(#fff 16px, transparent 1%) center,
                    #eee;
                background-size: 20px 20px;
            }
            .no-card {
                text-align: center;
                padding: 4em;
            }
        }
        margin-bottom: 0;
    }

    .editor-row {
        position: fixed;
        display: flex;
        flex-direction: column;
        z-index: 10;

        bottom: 0;
        left: 0;
        right: 0;

        .drag-handle {
            cursor: row-resize;
            border-top: 5px double #ddd;
            border-bottom: 5px double #ddd;
            background-color: white;
        }

        .editor-div {
            flex: 1;
            padding: 40px;
            background-color: white;
            overflow-y: auto;
        }

        &.fullscreen {
            top: 0;
            height: auto !important;

            .drag-handle:before {
                display: block;
                content: 'Exit fullscreen';
                background-color: #ddd;
                padding: .5em;
                text-align: center;
                font-weight: bold;
                cursor: pointer;
            }
        }
    }

    .browser-tools {
        text-align: center;
        position: fixed;
        bottom: 60px;
        left: 0;
        right: 0;
        pointer-events: none;

        .tools-container {
            display: none;
            pointer-events: initial;
            &.enabled {
                display: inline-block;
                z-index: 10;
            }
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
