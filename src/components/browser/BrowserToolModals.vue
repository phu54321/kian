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
  b-modal(id='browserChangeDeck', title='Change deck', lazy, @ok='changeDeck')
    list-selector(taggable, focus, title='Deck name', v-model='deck', :optionsFunc='listDeck')

  b-modal(id='browserChangeModel', title='Change model', lazy, @ok='changeModel')
    list-selector(focus, title='Model name', v-model='model', :optionsFunc='listModel')

  b-modal(id='browserAddTags', title='Add tags', lazy, @ok='addTags')
    tag-editor(focus, v-model='tags')

  b-modal(id='browserRemoveTags', title='Remove tags', lazy, @ok='removeTags')
    tag-editor(focus, v-model='tags')

  b-modal(id='browserResetSched', title='Forget cards', lazy, ok-variant='danger', @ok='resetSched')
    | Are you sure you want to reset(forget) this card's scheduling?

  b-modal(v-model='changeDueShow', id='browserChangeDue', title='Reschedule card', lazy, @ok='changeDue')
    | Change cards due to
    b.ml-2 {{formatDate(due)}}
    datepicker.mt-2(inline, bootstrap-styling, v-model='due')

  b-modal(id='browserRemoveCards', title='Delete cards', lazy, ok-variant='danger', @ok='deleteCards')
    | Really delete?
</template>

<script>
import ListSelector from '../common/ListSelector'
import TagEditor from '../common/TagEditor'
import { formatDate } from '@/utils/utils'

import {
  listModel,
  listDeck,

  updateCardDeck,
  updateCardModel,
  addCardTag,
  deleteCardTag,
  deleteCard,

  cardSchedReset,
  cardSchedReschedule
} from '@/api'

export default {
  props: ['selected'],
  components: {
    ListSelector,
    TagEditor
  },
  data () {
    return {
      deck: '',
      model: '',
      tags: [],
      due: null,
      changeDueShow: false
    }
  },
  computed: {
    listModel: () => listModel,
    listDeck: () => listDeck
  },
  watch: {
    changeDueShow (v) {
      if (v) {
        this.due = new Date()
      }
    }
  },
  methods: {
    formatDate,
    async changeDeck () {
      await updateCardDeck(this.selected, this.deck)
      this.deck = ''
      this.$emit('updateView')
    },
    async changeModel () {
      await updateCardModel(this.selected, this.model)
      this.model = ''
      this.$emit('updateCardIds')
    },
    async addTags () {
      await addCardTag(this.selected, this.tags)
      this.tags = []
      this.$emit('updateView')
    },
    async removeTags () {
      await deleteCardTag(this.selected, this.tags)
      this.tags = []
      this.$emit('updateView')
    },
    async resetSched () {
      await cardSchedReset(this.selected)
      this.$emit('updateView')
    },
    async changeDue () {
      const dueTimestamp = (this.due.getTime() / 1000) | 0
      await cardSchedReschedule(this.selected, {
        min: dueTimestamp,
        max: dueTimestamp
      })
      this.due = null
      this.$emit('updateView')
    },
    async deleteCards () {
      await deleteCard(this.selected)
      this.$emit('updateCardIds')
    }
  }
}
</script>
