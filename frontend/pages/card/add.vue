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
    h1 Add Note

    card-editor(v-model='card', @save='save')

    h3.mt-5 Recent 50 additions
    browser-view.history(:cardIds='addedCardIds', @updateCardIds='updateCardIds++')



</template>

<script>

import { mapGetters } from 'vuex';

import BrowserView from '~/components/browser/BrowserView';
import CardEditor from '~/components/editor/CardEditor';
import ErrorDialogVue from '~/components/ErrorDialog.vue';


const historyNum = 50;

export default {
    components: {
        CardEditor,
        BrowserView,
    },
    data () {
        return {
            card: {
                deck: '',
                model: '',
                fieldFormats: [],
                fields: [],
                tags: [],
            },
            addedCardIds: [],
            updateCardIds: 0,
        };
    },
    async asyncData () {
        const createdCards = await this.$ankiCall('browser_query', {
            query: '',
            sortBy: 'createdAt'
        });
        return {
            addedCardIds: createdCards.slice(0, historyNum)
        };
    },
    async mounted () {
        const userConfig = this.userConfig;
        this.card.deck = userConfig.currentDeck;
        this.card.model = userConfig.currentModel;
    },
    watch: {
        async updateCardIds () {
            const createdCards = await this.$ankiCall('browser_query', {
                query: '',
                sortBy: 'createdAt'
            });
            this.addedCardIds = createdCards.slice(0, historyNum);
        }
    },
    computed: {
        ...mapGetters([
            'userConfig'
        ]),
    },
    methods: {
        async save (card) {
            try {
                const {noteId} = await this.$ankiCall('note_add', {
                    deck: card.deck,
                    model: card.model,
                    fields: card.fields,
                    tags: card.tags,
                });

                // Clean non-sticky forms
                this.card.fieldFormats.forEach((fFormat, index) => {
                    if(!fFormat.sticky) {
                        this.card.fields.splice(index, 1, '');
                    }
                });

                // Add to history logs
                const cardIds = await this.$ankiCall('cid_from_nid', {noteId});
                this.addedCardIds.splice(0, 0, ...cardIds);
                this.addedCardIds = this.addedCardIds.slice(0, historyNum);

                this.$toasted.show('Note added', {
                    icon: 'plus-square',
                });
            } catch(e) {
                ErrorDialogVue.openErrorDialog('Error on adding notes', e.message);
            }
        }
    },
    name: 'note-add',
};

</script>

