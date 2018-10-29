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
  .float-right
    b-btn-group
      b-btn(variant='outline-primary', size='sm', @click='removeEmptyCards') Remove empty cards
      b-btn(variant='outline-primary', size='sm', @click='checkDatabase') Check database
      b-btn(variant='outline-primary', size='sm', @click='checkMedia') Check media

    b-modal(ref='checkMediaModal', lazy, title='Check media')
      h5 Missing items ({{missing.length}} items)
      ul.file-list
        li(v-for='item in missing') {{item}}

      h5 Unused items ({{unused.length}} items)
      ul.file-list
        li(v-for='item in unused') {{item}}

      template(slot='modal-footer')
        b-btn(variant='primary', size='sm', @click='removeUnusedMedia') Remove unused media
        b-btn(variant='secondary', size='sm', @click='$refs.checkMediaModal.hide()') Cancel

  h2 Config
</template>

<script>
import { getEmptyCards, checkMedia, checkDatabase, deleteCard, mediaDelete } from '@/api'

export default {
  data () {
    return {
      missing: [],
      unused: []
    }
  },

  methods: {
    async removeEmptyCards () {
      const loader = this.$loading.show()
      const cardIds = await getEmptyCards()
      if (cardIds.length) {
        this.$toasted.show(`${cardIds.length} empty card(s) removed.`)
        await deleteCard(cardIds)
      } else {
        this.$toasted.show('No empty cards.')
      }
      loader.hide()
    },

    async checkDatabase () {
      const loader = this.$loading.show()
      try {
        const ret = await checkDatabase()
        this.$toasted.show(ret, { icon: 'check' })
      } catch (e) {
        this.$toasted.error(e.message, { icon: 'exclamation-triangle' })
      } finally {
        loader.hide()
      }
    },

    async checkMedia () {
      const loader = this.$loading.show()
      try {
        const { missing, unused } = await checkMedia()
        this.missing = missing
        this.unused = unused
        this.$refs.checkMediaModal.show()
      } catch (e) {
        this.$toasted.error(e.message, { icon: 'exclamation-triangle' })
      } finally {
        loader.hide()
      }
    },

    async removeUnusedMedia () {
      const { unused } = this
      if (unused.length) {
        const deleteFailed = await mediaDelete(unused)
        const msg = (deleteFailed === 0)
          ? `${unused.length} unused files removed`
          : `${unused.length} unused files, ${unused.length - deleteFailed} removed`
        this.$toasted.show(msg, { icon: 'check' })
        this.unused = []
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.file-list {
    max-height: 10em;
    overflow-y: auto;
    border: 1px solid #eee;
    padding: 0;
    list-style-type: none;

    li {
        padding: .1em .6em;
        &:hover {
            background-color: #eee;
        }
    }
}

</style>
