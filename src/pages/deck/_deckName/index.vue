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
// along with this program.  If not, see "http://www.gnu.org/licenses/".

<template lang="pug">
div
  h2 Deck {{deckName}}

  table.mb-3
    tr
      th New
      td.newCount {{due.newCount}}
    tr
      th Learning
      td.lrnCount {{due.lrnCount}}
    tr
      th Review
      td.revCount {{due.revCount}}
    tr
      th Mature
      td.text-secondary {{stat.mature}}
    tr
      th Young
      td.text-secondary {{stat.young}}

    tr
      th Total
      td.text-secondary {{stat.total}}

  b-button(size='sm', v-hotkey="['space', 'enter']", title='Start studying' variant='outline-primary', :to='`/study/` + encodeURIComponent(deckName)') Study now
</template>

<script lang='ts'>
import { getDeckInfo, DeckStat, DeckDue } from '@/api'
import { Prop, Component, Vue } from 'vue-property-decorator'

@Component
export default class extends Vue {
  @Prop(String) deckName!: string
  stat = {} as DeckStat
  due = {} as DeckDue
  async created () {
    const { stat, due } = await getDeckInfo(this.deckName)
    this.stat = stat
    this.due = due
  }
}
</script>

<style lang="scss" scoped>

table {
  th {
      padding-right: 1em;
  }
}
</style>
