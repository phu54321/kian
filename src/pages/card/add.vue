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
    h1 Add Note

    card-editor(v-model='card', @save='save')

    h3.mt-5 Recent 50 additions
    browser-view.history(:cardIds='addedCardIds', @updateCardIds='updateCardIds++')
</template>

<script lang='ts'>
import BrowserView from '@/components/browser/BrowserView'
import CardEditor from '@/components/editor/CardEditor'
import ErrorDialogVue from '@/components/ErrorDialog.vue'
import { addNote, queryCardIds } from '@/api'

import { EditorCard } from '@/components/editor/types'
import { Getter, Action } from 'vuex-class'
import { Component, Watch, Vue } from 'vue-property-decorator'
import AsyncComputed from '@/utils/asyncComputedDecorator'

const historyNum = 50

@Component({
  components: {
    CardEditor,
    BrowserView
  }
}) export default class extends Vue {
  card: EditorCard = {
    id: null,
    deck: '',
    model: '',
    fieldFormats: [],
    fields: [],
    tags: []
  }
  updateCardIds = 0
  addedCardIds: number[] = []

  @Getter userConfig: any

  async asyncData () {
    const createdCardIds = await queryCardIds({
      query: '',
      sortBy: 'createdAt'
    })
    return {
      addedCardIds: createdCardIds.slice(0, historyNum)
    }
  }

  async mounted () {
    const userConfig = this.userConfig
    this.card.deck = userConfig.currentDeck
    this.card.model = userConfig.currentModel
  }

  @Watch('updateCardIds')
  async onCardIdUpdate () {
    const createdCardIds = await queryCardIds({
      query: '',
      sortBy: 'createdAt'
    })
    this.addedCardIds = createdCardIds.slice(0, historyNum)
  }

  @Action setCurrentModel: any
  @Action setCurrentDeck: any

  @Watch('cardModel')
  onCardModelUpdate (model: string) {
    this.setCurrentModel(model)
  }
  @Watch('cardDeck')
  onCardDeckUpdate (deck: string) {
    this.setCurrentDeck(deck)
  }

  get cardModel () { return this.card.model }
  get cardDeck () { return this.card.deck }

  async save () {
    try {
      const card = this.card
      await addNote({
        deck: card.deck,
        model: card.model,
        fields: card.fields,
        tags: card.tags
      })

      // Clean non-sticky forms
      card.fieldFormats.forEach((fFormat, index) => {
        if (!fFormat.sticky) {
          card.fields.splice(index, 1, '')
        }
      })

      // Add to history logs
      this.updateCardIds++

      this.$toasted.show('Note added', {
        icon: 'plus-square'
      })
    } catch (e) {
      ErrorDialogVue.openErrorDialog('Error on adding notes', e.message)
    }
  }
}
</script>
