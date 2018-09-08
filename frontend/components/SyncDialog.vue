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
b-modal(v-model='show', id='syncModal', title='Sync to AnkiWeb', @shown='onShow',
    hide-header-close, no-close-on-esc, no-close-on-backdrop, :hide-footer='!isLoginForm')
    template(v-if='isLoginForm')
        b-form-group(label='Email')
            b-form-input(v-model='email', type='email')

        b-form-group(label='Password')
            b-form-input(v-model='password', type='password')

        template(slot='modal-footer')
            b-btn(variant='primary', @click='startSync') Login
            b-btn(variant='outline-secondary', @click='show = false') Cancel

    template(v-else-if='fullSyncAsked')
        p Should issue full sync.
        b-btn(variant='outline-danger', @click='fullSyncOption("upload")') Upload
        b-btn.ml-1(variant='outline-danger', @click='fullSyncOption("download")') Download
        b-btn.ml-1(variant='outline-secondary', @click='fullSyncOption("cancel")') Cancel


    template(v-else)
        b-progress(:value='100', :max='100', animated)
        ul.list-group
            li.list-group-item(v-for='message in syncMessages') {{message}}

</template>

<script>

import {ankiCall} from '../api/ankiCall';

export default {
    data () {
        return {
            email: '',
            password: '',
            authKey: null,
            isLoginForm: true,
            show: false,
            syncTimeout: false,
            syncMessages: [],
            fullSyncAsked: null,
        };
    },
    methods: {
        onShow () {
            this.authKey = this.$cookie.get('authKey');
            if(this.authKey) {
                this.startSync();
            }
            else {
                this.isLoginForm = true;
            }
        },
        startSync () {
            this.isLoginForm = false;

            ankiCall('sync', {
                email: this.email,
                password: this.password,
                authKey: this.authKey,
            });

            this.syncTimeout = setTimeout(this.syncProcess, 1000);
        },
        syncProcess () {
            ankiCall('sync_status').then(msg => {
                for(let message of msg.messages) {
                    this.syncMessages.push(message);
                    this.processSyncMessage(message[0], message[1]);
                }
                if(msg.completed) {
                    this.show = false;
                    this.$router.go();
                }
                else {
                    this.syncTimeout = setTimeout(this.syncProcess, 1000);
                }
            });
        },
        processSyncMessage (cmd, arg) {
            if (cmd === 'fullSync') {
                this.fullSyncAsked = true;
            }
        },
        fullSyncOption (mode) {
            this.fullSyncAsked = false;
            ankiCall('sync_fullsync', {mode});
        },
    },
};

</script>

<style lang="scss" scoped>

.list-group{
    max-height: 300px;
    margin-bottom: 10px;
    overflow:scroll;
    -webkit-overflow-scrolling: touch;
}

</style>
