<template lang="pug">
div
    h1.mb-4 Browser

    b-form.queryBox(@submit.prevent='query = queryString.join(" ")')
        b-input-group
            space-seperated-input.sep-input.form-control(
                v-model='queryString',
                placeholder='Put some query in...'
                :validator='queryValidator',
                :suggestions='querySuggestion',
                :renderer='queryRenderer')

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
    methods: {
        queryValidator,
        queryRenderer (chunk) {
            if(chunk.startsWith('tag:')) {
                return {
                    variant: 'info',
                    title: chunk,
                };
            }
            else if(chunk.startsWith('deck:')) {
                return {
                    color: "#7995ff",
                    title: chunk,
                }
            }
        },
        async querySuggestion (chunk) {
            if(chunk.startsWith('tag:')) {
                const tagList = await this.fetchTags(chunk.substring(4));
                return tagList.map(tag => `tag:${tag}`)
                    .filter(tag => tag.startsWith(chunk));
            }
            else if(chunk.startsWith('deck:')) {
                const deckList = await ankiCall('deck_list');
                return deckList.map(deck =>
                    deck.indexOf(' ') == -1
                        ? `deck:${deck}`
                        : `deck:"${deck}"`)
                    .filter(deck => deck.startsWith(chunk));
            }
            return [];
        },
        async fetchTags(tag) {
            return ankiCall('tag_suggestions', {
                query: tag
            });
        }
    },
    components: {
        BrowserView,
        SpaceSeperatedInput,
    },
    name: 'browser',
};

function queryValidator (chunk) {
    // From anki/find.py
    let inQuote = false;
    let token = '';
    for(let i = 0 ; i < chunk.length ; i++) {
        const c = chunk[i];
        if(c == '"' || c == '\'') {
            if (inQuote) {
                if (c == inQuote) inQuote = false;
                else token += c;
            }
            else if (token) {
                if(token.endsWith(':')) inQuote = c;
                else token += c;
            }
            else inQuote = c;
        }
        else if(c == ' ' || c == '\u3000') {
            if (inQuote) token += c;
            else if(token) {
                token = '';
            }
        }
        else if(c == '(' || c == ')') {
            if (inQuote) token += c;
            else {
                if(c == ')' && token) {
                    token = '';
                }
            }
        }
        else if(c == '-') {
            if (token) token += c;
        }
        else token += c;
    }
    return !inQuote;
};

</script>

<style lang="scss" scoped>

.queryBox {
    margin: 1em 0;
    .sep-input {
        padding-left: .4em;
    }
}

</style>
