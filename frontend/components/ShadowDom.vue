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
    computed: {
        defaultStyle: () => '<style>img { max-width: 95%; max-height: 95%; }</style>',
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
            div.innerHTML = this.defaultStyle + html;
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
