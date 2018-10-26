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
b-modal(v-model='show', lazy, id='syncModal', title='Sync to AnkiWeb', @shown='onShow',
    hide-header-close, no-close-on-esc, no-close-on-backdrop, :hide-footer='!isLoginForm')
    template(v-if='isLoginForm')
        b-form-group(label='Email')
            b-form-input(v-model='email', type='email')

        b-form-group(label='Password')
            b-form-input(v-model='password', type='password')

        template(slot='modal-footer')
            b-btn(variant='primary', @click='startSync', v-hotkey='"enter"') Login
            b-btn(variant='outline-secondary', @click='show = false', v-hotkey='"esc"', pack-name='Sync dialog') Cancel

    template(v-else-if='fullSyncAsked')
        p Should issue full sync.
        b-btn(variant='outline-danger', @click='fullSyncOption("upload")') Upload
        b-btn.ml-1(variant='outline-danger', @click='fullSyncOption("download")') Download
        b-btn.ml-1(variant='outline-secondary', @click='fullSyncOption("cancel")', v-hotkey='"esc"', pack-name='Sync dialog') Cancel

    template(v-else)
        template(slot='modal-header')
            h4 Sync to AnkiWeb
            .float-right
                b-badge(variant='primary') Sent: {{formatBytes(sentBytes)}}
                b-badge.ml-2(variant='success') Recv: {{formatBytes(recvBytes)}}
        b-progress.mt-2(:value='100', :max='100', animated)
        ul.list-group(ref='messageContainer')
            li.list-group-item(v-for='message in syncMessages') {{message}}
</template>

<script>
import ErrorDialog from './ErrorDialog'
import { issueSync } from '@/api'

export default {
  data () {
    return {
      show: false,
      authKey: null,

      isLoginForm: true,
      email: '',
      password: '',

      syncTimeout: null,
      syncMessages: [],

      fullSyncAsked: false,
      sentBytes: 0,
      recvBytes: 0
    }
  },
  updated () {
    const container = this.$refs.messageContainer
    if (container) container.scrollTop = container.scrollHeight
  },
  methods: {
    formatBytes (bytes) {
      if (bytes >= 1024 * 1024) {
        return (bytes / 1024 / 1024).toFixed(1) + 'MB'
      } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(1) + 'KB'
      } else {
        return bytes + 'B'
      }
    },
    onShow () {
      this.syncMessages = []
      this.authKey = this.$localStorage.get('syncKey')
      if (this.authKey) {
        this.email = this.password = ''
        this.startSync()
      } else {
        this.isLoginForm = true
      }
    },
    startSync () {
      this.isLoginForm = false
      this.syncMessages = []
      this.sentBytes = 0
      this.recvBytes = 0

      const auth = {
        email: this.email,
        password: this.password,
        authKey: this.authKey
      }
      const callbacks = {
        onNewAuthkey: (key) => {
          if (key === null) this.$localStorage.remove('syncKey')
          else this.$localStorage.set('syncKey', key)
        },
        onSyncMessage: (msg) => {
          this.syncMessages.push(msg)
        },
        onTransferUpdate: (sent, recv) => {
          this.sentBytes = sent
          this.recvBytes = recv
        }
        // TODO: Add Fullsync support
      }
      issueSync(auth, callbacks)
        .then(() => {
          this.syncTimeout = null
          this.show = false
          window.onbeforeunload = undefined
          this.$router.go()
        }).catch(err => {
          ErrorDialog.openErrorDialog('Sync failed', err.message)
          this.show = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>

.list-group{
    max-height: 300px;
    min-height: 10px;
    margin-bottom: 10px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

</style>
