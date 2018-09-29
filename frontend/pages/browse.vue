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
    h1.mb-4 Browser

    .queryBox(@submit.prevent='query = queryString.join(" ")')
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
                b-btn(variant='info', v-b-modal.browserHelp, title='Help', v-b-tooltip.hover)
                    icon(name='question')
                b-btn(variant='secondary', title='Refresh browser', v-b-tooltip.hover, @click='updateCardIds++')
                    icon(name='sync')
        b-modal(id='browserHelp', title='Browser help')
            | TODO: Add help here

    browser-view.mt-2(:loading='loading', :cardIds='cardIds', enableSort, :sortBy.sync='sortBy', :sortOrder.sync='sortOrder', @updateCardIds='updateCardIds++')
</template>

<script>

import BrowserView from '~/components/browser/BrowserView';
import SpaceSeperatedInput from '~/components/common/SpaceSeperatedInput';

import { fuzzyMatch } from '~/utils/utils';
import { listModel } from '~/api';
import { listDeck } from '~/api';
import { findCards } from '~/api';
import _ from 'lodash';

function parseInitialQuery (query) {
    // if query == '', query.split(' ') becomes [''] rather than []
    // so general code won't work
    if (query === '') return [];

    const ret = [];
    let currentToken = '';
    for (const s of query.split(' ')) {
        currentToken += s;
        if (queryValidator(currentToken)) {
            ret.push(currentToken);
            currentToken = '';
        } else currentToken += ' ';
    }
    return ret;
}

function parseQueryToken (tok) {
    const pos = tok.indexOf(':');
    if (pos === -1) return { model: null, body: tok };
    const model = tok.substr(0, pos);
    let body = tok.substr(pos + 1);

    if (body.startsWith('"')) {
        body = body.substr(1);
        if (body.endsWith('"')) body = body.substr(0, body.length - 1);
    }
    else if (body.startsWith('\'')) {
        body = body.substr(1);
        if (body.endsWith('\'')) body = body.substr(0, body.length - 1);
    }
    return { model, body };
}

function wrapString (tok) {
    if (tok.indexOf(' ') === -1 && tok.indexOf(':') === -1) return tok;
    else return `"${tok}"`;
}

export default {
    data () {
        const initialQuery = this.$route.query.q || '';
        return {
            queryString: parseInitialQuery(initialQuery || ''),
            query: initialQuery,
            sortBy: 'id',
            sortOrder: 'desc',
            updateCardIds: 0,
            loading: true,
        };
    },
    watch: {
        queryString: _.debounce(function () {
            this.query = this.queryString.join(' ');
            this.$router.replace(`/browse?q=${encodeURIComponent(this.query)}`);
        }, 200),
    },
    asyncComputed: {
        cardIds: {
            get () {
                return findCards({
                    query: this.query,
                    sortBy: this.sortBy,
                    sortOrder: this.sortOrder,
                }).then(cardIds => {
                    return cardIds;
                }).catch(_err => {
                    // This can happen on false queries
                    return [];
                });
            },
            watch () {
                this.updateCardIds;
            },
            default: null,
        },
    },
    methods: {
        queryValidator,
        queryRenderer (chunk) {
            if (chunk.startsWith('-')) {
                return {
                    variant: 'danger',
                    title: chunk,
                };
            }

            const { model, body } = parseQueryToken(chunk);
            if (model === 'tag') {
                return {
                    variant: 'info',
                    title: `Tag: ${body}`,
                };
            }
            if (model === 'deck') {
                return {
                    color: '#4caf50',
                    title: `Deck: ${body}`,
                };
            }
            if (model === 'note' || model === 'mid') {
                return {
                    color: '#f3801c',
                    title: `Model: ${body}`,
                };
            }
            if (model === 'is') {
                return {
                    color: '#9c27b0',
                    title: `Is: ${body}`,
                };
            }
        },
        async querySuggestion (chunk) {
            if (chunk.startsWith('-')) {
                return (await this.querySuggestion(chunk.slice(1))).map(x => `-${x}`);
            }

            const { model, body } = parseQueryToken(chunk);
            if (model === 'tag') {
                const tagList = await this.fetchTags(chunk.substring(4));
                return tagList.
                    filter(tag => fuzzyMatch(body, tag)).
                    map(tag => `tag:${tag}`);
            }
            else if (model === 'deck') {
                const deckList = await listDeck();
                return (
                    deckList.filter(deck => fuzzyMatch(body, deck))
                        .sort()
                        .map(wrapString)
                        .map(deck => `deck:${deck}`)
                );
            }
            else if (model === 'model' || model === 'note') {
                const modelList = await listModel();
                return (
                    modelList.filter(model => fuzzyMatch(body, model))
                        .sort()
                        .map(wrapString)
                        .map(model => `note:${model}`)
                );
            }
            else if (model === 'is') {
                return [
                    'is:due',
                    'is:new',
                    'is:learn',
                    'is:review',
                    'is:suspended',
                    'is:buried',
                ].filter(c => fuzzyMatch(chunk, c));
            }
            return [];
        },
        async fetchTags (tag) {
            return this.$ankiCall('tag_suggestions', {
                query: tag,
            });
        },
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
    for (let i = 0 ; i < chunk.length ; i++) {
        const c = chunk[i];
        if (c === '"' || c === '\'') {
            if (inQuote) {
                if (c === inQuote) inQuote = false;
                else token += c;
            }
            else if (token) {
                if (token.endsWith(':')) inQuote = c;
                else token += c;
            }
            else inQuote = c;
        }
        else if (c === ' ' || c === '\u3000') {
            if (inQuote) token += c;
            else if (token) {
                token = '';
            }
        }
        else if (c === '(' || c === ')') {
            if (inQuote) token += c;
            else {
                if (c === ')' && token) {
                    token = '';
                }
            }
        }
        else if (c === '-') {
            if (token) token += c;
        }
        else token += c;
    }
    return !inQuote;
}

</script>

<style lang="scss" scoped>

.queryBox {
    position: sticky;
    padding: .1px 0;
    top: 0;
    background-color: #fff;
    z-index: 2;

    .sep-input {
        padding-left: .4em;
    }
}

</style>
