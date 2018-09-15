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
    b-modal(v-model='modalShow', lazy, size='lg', :title='title', :return-focus='retFocus')
        template(v-if='msg')
            pre.mt-3 {{msg}}
        div(slot='modal-footer')
            b-button(v-hotkey=['enter'], variant='outline-danger', @click='modalShow = false') Close
</template>

<script>

import Vue from 'vue';
const eventHub = new Vue();

export default {
    openErrorDialog (title, msg) {
        eventHub.$emit('errormsg', {
            title,
            msg,
            retFocus: document.activeElement,
        });
    },
    created () {
        eventHub.$on('errormsg', this.openErrorMessage);
    },
    beforeDestroy () {
        eventHub.$off('errormsg');
    },
    methods: {
        openErrorMessage (data) {
            this.title = data.title;
            this.msg = data.msg;
            this.retFocus = data.retFocus;
            this.modalShow = true;
        }
    },
    data () {
        return {
            modalShow: false,
            title: 'Hello from Modal!',
            msg: 'asdf\nasdf\nasdf',
            retFocus: null,
        };
    },
};

</script>

<style lang="scss" scoped>

pre {
    font-family: inherit;
}

</style>
