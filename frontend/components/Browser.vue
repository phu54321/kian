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
                b-btn(variant='info', v-b-modal.browserHelp)
                    icon(name='question', v-b-tooltip, title='Help')
        b-modal(id='browserHelp', title='Browser help')
            | TODO: Add help here

    browser-view(:cardIds='cardIds', enableSort, :sortBy.sync='sortBy', :sortOrder.sync='sortOrder')
</template>

<script>

import BrowserView from './browser/BrowserView';
import { ankiCall } from '../api/ankiCall';
import SpaceSeperatedInput from './common/SpaceSeperatedInput';
import _ from 'lodash';

function parseQueryToken (tok) {
    const pos = tok.indexOf(':');
    if(pos === -1) return { model: null, body: tok };
    const model = tok.substr(0, pos);
    let body = tok.substr(pos + 1);

    if(body.startsWith('"')) {
        body = body.substr(1);
        if(body.endsWith('"')) body = body.substr(0, body.length - 1);
    }
    else if(body.startsWith('\'')) {
        body = body.substr(1);
        if(body.endsWith('\'')) body = body.substr(0, body.length - 1);
    }
    return { model, body };
}

function wrapString (tok) {
    if(tok.indexOf(' ') === -1) return tok;
    else return `"${tok}"`;
}

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
                }).catch(_err => {
                    // This can happen
                    return [];
                });
            },
            default: []
        },
    },
    methods: {
        queryValidator,
        queryRenderer (chunk) {
            if(chunk.startsWith('-')) {
                return {
                    variant: 'danger',
                    title: chunk
                };
            }

            const { model, body } = parseQueryToken(chunk);
            if(model == 'tag') {
                return {
                    variant: 'info',
                    title: `Tag: ${body}`,
                };
            }
            if(model == 'deck') {
                return {
                    color: '#4caf50',
                    title: `Deck: ${body}`,
                };
            }
            if(model == 'note' || model == 'mid') {
                return {
                    color: '#f3801c',
                    title: `Model: ${body}`,
                };
            }
            if(model == 'is') {
                return {
                    color: '#9c27b0',
                    title: `Is: ${body}`,
                };
            }
        },
        async querySuggestion (chunk) {
            if(chunk.startsWith('-')) {
                return (await this.querySuggestion(chunk.slice(1))).map(x => `-${x}`);
            }

            const { model, body } = parseQueryToken(chunk);
            if(model == 'tag') {
                const tagList = await this.fetchTags(chunk.substring(4));
                return tagList.
                    filter(tag => tag.startsWith(body)).
                    map(tag => `tag:${tag}`);
            }
            else if(model == 'deck') {
                const deckList = await ankiCall('deck_list');
                return (
                    deckList.filter(deck => deck.startsWith(body))
                        .sort()
                        .map(wrapString)
                        .map(deck => `deck:${deck}`)
                );
            }
            else if(model == 'model' || model == 'note') {
                const modelList = await ankiCall('model_list');
                return (
                    modelList.filter(model => model.toLowerCase().startsWith(body.toLowerCase()))
                        .sort()
                        .map(wrapString)
                        .map(model => `note:${model}`)
                );
            }
            else if(model == 'is') {
                return [
                    'is:due',
                    'is:new',
                    'is:learn',
                    'is:review',
                    'is:suspended',
                    'is:buried',
                ].filter(c => c.startsWith(chunk));
            }
            return [];
        },
        async fetchTags (tag) {
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
}

</script>

<style lang="scss" scoped>

.queryBox {
    margin: 1em 0;
    .sep-input {
        padding-left: .4em;
    }
}

</style>
