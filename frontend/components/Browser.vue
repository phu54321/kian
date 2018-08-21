<template lang="pug">
div
    h1.mb-4 Browser
    

    b-form.queryBox(@submit.prevent='query = queryString')
        b-input-group
            b-input(v-model='queryString', placeholder='Search for...')
            // space-seperated-input(v-model='queryString')
            
            b-input-group-append
                b-btn(variant='primary', type='submit') Search
    browser-view(:cardIds='cardIds', enableSort, :sortBy.sync='sortBy', :sortOrder.sync='sortOrder')
</template>

<script>

import BrowserView from './browser/BrowserView';
import { ankiCall } from '../api/ankiCall';
import SpaceSeperatedInput from './common/SpaceSeperatedInput';

export default {
    data () {
        return {
            queryString: '',
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
        BrowserView,
        SpaceSeperatedInput,
    },
    name: 'browser',
};
</script>

<style lang="scss" scoped>

.queryBox {
    margin: 1em 0;
    // border: 1px solid #eee;
    // padding: .2em .5em;
}

</style>
