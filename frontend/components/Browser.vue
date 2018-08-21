<template lang="pug">
div
    h1.mb-4 Browser
    

    b-form.queryBox(@submit.prevent='query = queryString.join(" ")')
        b-input-group
            space-seperated-input.sep-input.form-control(v-model='queryString')
            
            b-input-group-append
                b-btn(variant='primary', type='submit')
                    icon(name='search')

    browser-view(:cardIds='cardIds', enableSort, :sortBy.sync='sortBy', :sortOrder.sync='sortOrder')
</template>

<script>

import BrowserView from './browser/BrowserView';
import { ankiCall } from '../api/ankiCall';
import SpaceSeperatedInput from './common/SpaceSeperatedInput';
import _ from 'lodash';

export default {
    data () {
        return {
            queryString: [],
            query: '',
            sortBy: 'id',
            sortOrder: 'desc',
        };
    },
    watch: {
        queryString: _.debounce(function () {
            this.query = this.queryString.join(' ');
        }, 200)
    },
    asyncComputed: {
        cardIds: {
            get () {
                return ankiCall('browser_query', {
                    query: this.query,
                    sortBy: this.sortBy,
                    sortOrder: this.sortOrder,
                }).catch(err => {
                    console.log(err);
                    return [];
                })
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
    .sep-input {
        padding-left: .4em;
    }
}

</style>
