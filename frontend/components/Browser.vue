<template lang="pug">
div
    h1.mb-4 Browser
    browser-view(:cardIds='cardIds', enableSort, :sortBy.sync='sortBy', :sortOrder.sync='sortOrder')
</template>

<script>

import BrowserView from './browser/BrowserView';
import { ankiCall } from '../api/ankiCall';

export default {
    data () {
        return {
            query: '',
            sortBy: 'id',
            sortOrder: 'desc',
        };
    },
    asyncComputed: {
        cardIds: {
            async get () {
                return await ankiCall('browser_query', {
                    query: this.query,
                    sortBy: this.sortBy,
                    sortOrder: this.sortOrder,
                });
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
