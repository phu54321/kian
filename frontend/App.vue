<template lang='pug'>
  v-app
    nprogress-container
    v-toolbar(dark)
        v-toolbar-side-icon
        v-toolbar-title Kian
        v-spacer
        v-tooltip(bottom)
        v-toolbar-items
            v-tooltip(bottom)
                v-btn(slot="activator", icon, to="/decks")
                    v-icon dashboard
                span Home

            v-tooltip(bottom)
                v-btn(slot="activator", icon, to="/browse")
                    v-icon search
                span Browse

            v-tooltip(bottom)
                v-btn(slot="activator", icon, to="/statistics")
                    v-icon equalizer
                span Statistics
    v-content
      router-view
</template>

<script>

import NprogressContainer from 'vue-nprogress/src/NprogressContainer';

export default {
    components: {
        NprogressContainer
    },
    data() {
        return { msg: 'world' };
    }
};
</script>
