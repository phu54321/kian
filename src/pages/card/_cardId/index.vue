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
  b-form(@submit='save')
    h2 Edit card

    card-editor(v-model='card', @save='save')
</template>

<script lang='ts'>
import CardEditor from '@/components/editor/CardEditor'
import { getCard, updateCard } from '@/api'
import { Prop, Component, Vue } from 'vue-property-decorator'
import { EditorCard } from '@/components/editor/types'

@Component({
  components: { CardEditor }
}) export default class extends Vue {
  @Prop(Number) cardId!: number
  card: EditorCard = {
    id: null,
    deck: '',
    model: '',
    fields: [],
    fieldFormats: [],
    tags: []
  }
  save () {
    const card = this.card
    updateCard(this.cardId, {
      deck: card.deck,
      model: card.model,
      fields: card.fields,
      tags: card.tags
    }).then(() => {
      this.$router.go(-1)
    }).catch(err => {
      this.$errorDialog('Card edit failed', err.message)
    })
  }
  async asyncData (props: { cardId: number }) {
    const cardId = props.cardId
    const card = await getCard(cardId)
    return {
      card: {
        model: card.model,
        deck: card.deck,
        fields: card.fields,
        fieldFormats: card.fieldFormats,
        tags: card.tags
      }
    }
  }
}
</script>
