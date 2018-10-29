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
    div
        div(v-for='deck in tree', :key='deck.fullname')
            b-link(:to='"/deck/" + encodeURIComponent(deck.fullname)', router-tag='div')
                // Indent
                div.deck-row(:style='{"margin-left": (2 * indent) + "em"}')
                    // Deck name
                    span.pl-2.pr-2.mr-2(@click.stop='toggleDeckCollapse(deck)')
                        template(v-if='deck.subDecks.length')
                            icon(v-if='deck.collapsed', name='regular/plus-square', scale=0.7)
                            icon(v-else, name='regular/minus-square', scale=0.7)
                        icon.hidden(v-else, name='plus-square', scale=0.7)
                    span {{deck.name}}

                    // Deck due
                    div.float-right
                            span.newCount {{deck.due.newCount}}
                            | &nbsp;+&nbsp;
                            span.revCount {{deck.due.lrnCount + deck.due.revCount}}
            deck-tree-view(v-if='!deck.collapsed', :tree='deck.subDecks', :indent='indent + 1')

</template>

<script lang='ts'>
import { collapseDeck, DeckTree, DeckTreeLeaf } from '@/api'
import Vue from 'vue'

export default Vue.extend({
  props: {
    tree: Array,
    indent: Number
  },
  methods: {
    toggleDeckCollapse (deck: DeckTreeLeaf) {
      const newCollapsed = !deck.collapsed
      collapseDeck(
        deck.fullname,
        !deck.collapsed
      ).then(() => {
        deck.collapsed = newCollapsed
      }).catch(e => {
        this.$errorDialog('Deck could not be collapsed', e.message)
      })
    }
  },
  name: 'deck-tree-view'
})
</script>

<style scoped lang='scss'>

.deck-row {
    border-bottom: .5px solid #ddd;
    padding: .5em;
    &:hover {
        background-color: #eee;
    }
}

.hidden {
    visibility: hidden;
}
</style>
