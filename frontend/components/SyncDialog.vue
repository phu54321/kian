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

    template(v-else)
        b-progress(:value='100', :max='100', animated)

</template>

<script>

import {ankiCall} from '../api/ankiCall';
import ErrorDialog from './ErrorDialog';

export default {
    data () {
        return {
            email: '',
            password: '',
            authKey: null,
            isLoginForm: true,
            show: false,
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
            }).then(_msg => {
                this.show = false;
                this.$router.go(); // Refresh current router
            }).catch(err => {
                this.show = false;
                ErrorDialog.openErrorDialog('Sync error', err);
            });
        }
    },
};

</script>
