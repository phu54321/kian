<template lang="pug">
    b-modal(v-model='modalShow', size='lg', :title='title', :return-focus='retFocus')
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
