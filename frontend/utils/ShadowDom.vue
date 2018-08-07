<template lang="pug">
    div
</template>

<script>
export default {
    props: ['html'],
    data () {
        return {
            shadowRoot: null
        };
    },
    watch: {
        html (val) {
            this.fillHtml(val);
        },
    },
    methods: {
        fillHtml (html) {
            const shadowRoot = this.shadowRoot;
            if (!shadowRoot) return;
            while(shadowRoot.firstChild) shadowRoot.removeChild(shadowRoot.firstChild);
            
            const div = document.createElement('div');
            div.innerHTML = html;
            while(div.firstChild) shadowRoot.appendChild(div.firstChild);
        }
    },
    mounted () {
        this.shadowRoot = this.$el.attachShadow({mode: 'closed'});
        this.fillHtml(this.html);
    },
    beforeDestroy () {
        this.shadowRoot = null;        
    },
};
</script>
