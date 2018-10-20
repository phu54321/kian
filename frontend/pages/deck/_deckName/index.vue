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
b-container.pt-4
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

<script>

import { getDeckInfo } from '@/api'

export default {
  props: ['deckName'],
  async asyncData (props) {
    return getDeckInfo(props.deckName)
  },
  data () {
    return {
      stat: {},
      due: {}
    }
  },
  name: 'deck-view'
}
</script>

<style lang="scss" scoped>

table {
    th {
        padding-right: 1em;
    }
}
</style>
