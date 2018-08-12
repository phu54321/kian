<template lang="pug">
div
    h2 Browser
    
    browser-view(v-model='query')
</template>

<script>
import { ankiCall } from '../api/ankiCall';
import asyncData from '../utils/asyncData';
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
