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
                b-badge(variant='primary') Sent: {{formatBytes(sendBytes)}}
                b-badge.ml-2(variant='success') Recv: {{formatBytes(recvBytes)}}
        b-progress.mt-2(:value='100', :max='100', animated)
        ul.list-group(ref='messageContainer')
            li.list-group-item(v-for='message in syncMessages') {{message}}

</template>

<script>


import ankiCall from '~/api/ankiCall';
import ErrorDialog from './ErrorDialog';

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
            recvBytes: 0,
        };
    },
    updated () {
        const container = this.$refs.messageContainer;
        if(container) container.scrollTop = container.scrollHeight;
    },
    methods: {
        formatBytes (bytes) {
            if(bytes >= 1024 * 1024) {
                return (bytes / 1024 / 1024).toFixed(1) + 'MB';
            } else if(bytes >= 1024) {
                return (bytes / 1024).toFixed(1) + 'KB';
            } else {
                return bytes + 'B';
            }
        },
        onShow () {
            this.syncMessages = [];
            this.authKey = this.$cookie.get('syncKey');
            if(this.authKey) {
                this.email = this.password = '';
                this.startSync();
            }
            else {
                this.isLoginForm = true;
            }
        },
        startSync () {
            this.isLoginForm = false;
            this.sendBytes = 0;
            this.recvBytes = 0;

            ankiCall('sync', {
                email: this.email,
                password: this.password,
                authKey: this.authKey,
            }).then(() => {
                this.syncTimeout = setTimeout(this.syncProcess, 500);
            }).catch(err => {
                ErrorDialog.openErrorDialog('Sync failed', err.message);
                this.show = false;
            });
        },
        syncProcess () {
            ankiCall('sync_status').then(msg => {
                for(let message of msg.messages) {
                    this.processSyncMessage(message[0], message[1]);
                }

                if(msg.completed) {
                    this.syncTimeout = null;
                    this.show = false;
                    window.onbeforeunload = undefined;
                    this.$router.go();
                }
                else {
                    this.syncTimeout = setTimeout(this.syncProcess, 500);
                }
            });
        },
        processSyncMessage (cmd, arg) {
            if (cmd === 'badAuth') {
                ErrorDialog.openErrorDialog('Sync failed', 'Invalid AnkiWeb ID/Password');
                this.$cookie.delete('syncKey');
            } else if(cmd === 'newKey') {
                this.$cookie.set('syncKey', arg);
            } else if(cmd === 'offline') {
                this.$toasted.show('Internet offline');
            } else if(cmd === 'upbad') {
                this.syncMessages.push('Uploading failed.');
            } else if(cmd === 'send') {
                this.sendBytes = arg;
            } else if(cmd === 'recv') {
                this.recvBytes = arg;
            } else if(cmd === 'sync') {
                const type = arg[0];
                switch(type) {
                case 'login':
                    this.syncMessages.push('Logon to AnkiWeb');
                    break;
                case 'upload':
                    this.syncMessages.push('Performing full upload to AnkiWeb.');
                    break;
                case 'download':
                    this.syncMessages.push('Performing full download from AnkiWeb.');
                    break;
                case 'sanity':
                    this.syncMessages.push('Checking database.');
                    break;
                case 'findMedia':
                    this.syncMessages.push('Checking media.');
                    break;
                case 'upgradeRequited':
                    this.$toasted.show('Deck upgrade required. Please visit AnkiWeb.');
                    break;
                }
            } else if(cmd === 'syncMsg') {
                this.syncMessages.push(arg);
            } else if(cmd === 'error') {
                ErrorDialog.openErrorDialog('Sync failed', arg);
            } else if(cmd === 'clockOff') {
                ErrorDialog.openErrorDialog('Sync failed', 'Check again your computer\'s clock.');
            } else if(cmd === 'checkFailed') {
                ErrorDialog.openErrorDialog('Sync failed', 'Database check failed.');
            } else if(cmd === 'noChanges') {
                this.syncMessages.push('No database changes');
            } else if(cmd === 'noMediaChanges') {
                this.syncMessages.push('No media changes');
            } else if (cmd === 'fullSync') {
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
    min-height: 10px;
    margin-bottom: 10px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

</style>
