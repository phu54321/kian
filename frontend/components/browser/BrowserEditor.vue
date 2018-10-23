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
card-editor(
    v-if='card',
    v-model='card',
    deck-fixed,
    model-fixed,
    @save='onNoteEdit(false)'
)
</template>

<script>

import CardEditor from '../editor/CardEditor'
import ErrorDialog from '../ErrorDialog'
import { getCard, updateCard } from '@/api'

export default {
  props: ['cardId'],
  components: {
    CardEditor,
    ErrorDialog
  },
  data () {
    return {
      card: {
        id: null,
        deck: '',
        model: '',
        fieldFormats: [],
        fields: [],
        tags: []
      }
    }
  },
  async asyncData (props) {
    return {
      card: await getCard(props.cardId)
    }
  },
  watch: {
    async cardId (value) {
      await this.onNoteEdit(true)
      this.$emit('updateView')
      this.card = await getCard(value)
    }
  },
  methods: {
    async onNoteEdit (silent) {
      try {
        const card = this.card
        await updateCard(card.id, {
          deck: card.deck,
          model: card.model,
          fields: card.fields,
          tags: card.tags
        })
        if (silent) return

        this.$toasted.show('Edit saved', {
          icon: 'save'
        })
        this.$emit('updateCardIds')
      } catch (err) {
        ErrorDialog.openErrorDialog(null, err.message)
      }
    }
  },
  beforeDestroy () {
    this.onNoteEdit(true)
    this.$emit('updateView')
  }
}

</script>
