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
import { mapGetters, mapActions } from 'vuex'

import BrowserView from '@/components/browser/BrowserView'
import CardEditor from '@/components/editor/CardEditor'
import ErrorDialogVue from '@/components/ErrorDialog.vue'

import { addNote, queryCardIds } from '@/api'
import { EditorCard } from '@/components/editor/types'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

const historyNum = 50

@Component({
  components: {
    CardEditor,
    BrowserView
  }
})
export default class extends Vue {
  card: EditorCard = {
    id: null,
    deck: '',
    model: '',
    fieldFormats: [],
    fields: [],
    tags: []
  }
  addedCardIds: number[] = []
  updateCardIds = 0

  async created () {
    const createdCards = await queryCardIds({ query: '', sortBy: 'createdAt', sortOrder: 'desc' })
    this.addedCardIds = createdCards.slice(0, historyNum)
  }

  async mounted () {
    const userConfig = this.getUserConfig
    this.card.deck = userConfig.currentDeck
    this.card.model = userConfig.currentModel
  }

  @Getter('userConfig') getUserConfig: any
  get cardModel () { return this.card.model }
  get cardDeck () { return this.card.deck }

  @Watch('updateCardIds') async onUpdateCardIds () {
    const createdCards = await queryCardIds({
      query: '',
      sortBy: 'createdAt'
    })
    this.addedCardIds = createdCards.slice(0, historyNum)
  }

  @Action('setCurrentDeck') setCurrentDeck: any
  @Action('setCurrentModel') setCurrentModel: any

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
      this.$errorDialog('Error on adding notes', e.message)
    }
  }
}
</script>
