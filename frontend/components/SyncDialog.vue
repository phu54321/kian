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

import ankiCall from '~/api/ankiCall';
import ErrorDialog from './ErrorDialog';

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

            ankiCall('sync', {
                email: this.email,
                password: this.password,
                authKey: this.authKey,
            }).then(() => {
                this.syncTimeout = setTimeout(this.syncProcess, 1000);
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
                    // this.$router.go();
                }
                else {
                    this.syncTimeout = setTimeout(this.syncProcess, 1000);
                }
            });
        },
        processSyncMessage (cmd, args) {
            if (cmd === 'badAuth') {
                ErrorDialog.openErrorDialog('Sync failed', 'Invalid AnkiWeb ID/Password');
                this.$cookie.delete('syncKey');
            } else if(cmd === 'newKey') {
                this.$cookie.set('syncKey', args);
            } else if(cmd === 'offline') {
                this.$toasted.show('Internet offline');
            } else if(cmd === 'upbad') {
                this.syncMessages.push('Uploading failed.');
            } else if(cmd === 'sync') {
                const type = args[0];
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
                this.syncMessages.push(args[0]);
            } else if(cmd === 'error') {
                ErrorDialog.openErrorDialog('Sync failed', args[0]);
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
    overflow-x: auto;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
}

</style>
