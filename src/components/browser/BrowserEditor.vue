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

<script lang='ts'>
import CardEditor from '../editor/CardEditor'
import { getCard, updateCard } from '@/api'
import { Prop, Watch, Component, Vue } from 'vue-property-decorator'
import { EditorCard } from '@/components/editor/types'

@Component({
  components: {
    CardEditor
  }
})
export default class extends Vue {
  @Prop(Number) cardId!: number

  card: EditorCard = {
    id: null,
    deck: '',
    model: '',
    fieldFormats: [],
    fields: [],
    tags: []
  }

  async asyncData (props: Record<string, any>) {
    return {
      card: await getCard(props.cardId)
    }
  }

  @Watch('cardId')
  async function (value: number) {
    await this.onNoteEdit(true)
    this.$emit('updateView')
    this.card = await getCard(value)
  }

  async onNoteEdit (silent: boolean) {
    try {
      const card = this.card
      await updateCard(card.id!, {
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
      this.$errorDialog('Card edit failed', err.message)
    }
  }

  beforeDestroy () {
    this.$emit('updateView')
    this.onNoteEdit(true)
      .catch(e => {
        this.$errorDialog('Edit failed', e.message)
      })
  }
}
</script>
