<template lang="pug">
    b-modal(v-model='modalShow')
        span(slot='modal-title') Error occured
        span {{title}}
        template(v-if='msg')
            pre.mt-3 {{msg}}
        div(slot='modal-footer')
            b-button(variant='outline-danger', @click='modalShow = false') Close
</template>

<script>

import Vue from 'vue';
const eventHub = new Vue();

export default {
    openErrorDialog (title, msg) {
        eventHub.$emit('errormsg', {
            title,
            msg
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
            this.modalShow = true;
        }
    },
    data () {
        return {
            modalShow: false,
            title: 'Hello from Modal!',
            msg: 'asdf\nasdf\nasdf'
        };
    },
};

</script>
