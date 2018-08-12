<template lang="pug">
div
    h2 Browser
    
    browser-view(:query='query')
</template>

<script>

import BrowserView from './browser/BrowserView';

export default {
    data () {
        return {
            query: ''
        };
    },
    components: {
        BrowserView
    },
    name: 'browser',
};
</script>
