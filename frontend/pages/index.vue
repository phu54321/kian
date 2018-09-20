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
    h2 Deck list

    deck-tree-view(:tree='deckDueTree', :indent='0')
</template>

<script>

import DeckTreeView from '~/components/dashboard/DeckTreeView';

export default {
    async asyncData () {
        const response = await this.$ankiCall('dashboard_deck_tree');
        return {
            deckDueTree: response
        };
    },
    data () {
        return {
            deckDueTree: []
        };
    },
    components: {
        DeckTreeView
    },
    name: 'dashboard',
};
</script>