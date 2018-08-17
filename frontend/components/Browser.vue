<template lang="pug">
div
    h2 Browser
    
    browser-view(:cardIds='cardIds')
</template>

<script>

import BrowserView from './browser/BrowserView';
import { ankiCall } from '../api/ankiCall';

export default {
    data () {
        return {
            query: ''
        };
    },
    asyncComputed: {
        cardIds: {
            async get () {
                return (await ankiCall('browser_query', {
                    query: this.query,
                })).slice(0, 100);
            },
            default: []
        },
    },
    components: {
        BrowserView
    },
    name: 'browser',
};
</script>
