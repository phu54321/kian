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
    b-modal(id='browserChangeDeck', title='Change deck', lazy, @ok='changeDeck')
        list-selector(taggable, focused, title='Deck name', v-model='deck', apiType='deck_list')

    b-modal(id='browserChangeModel', title='Change model', lazy, @ok='changeModel')
        list-selector(focused, title='Model name', v-model='model', apiType='model_list')

    b-modal(id='browserAddTags', title='Add tags', lazy, @ok='addTags')
        tag-editor(focused, v-model='tags')

    b-modal(id='browserRemoveTags', title='Remove tags', lazy, @ok='removeTags')
        tag-editor(focused, v-model='tags')

    b-modal(id='browserResetSched', title='Forget cards', lazy, ok-variant='danger', @ok='resetSched')
        | Are you sure you want to reset(forget) this card's scheduling?

    b-modal(v-model='changeDueShow', id='browserChangeDue', title='Reschedule card', lazy, @ok='changeDue')
        | Change cards due to
        b.ml-2 {{formatDate(due)}}
        datepicker.mt-2(inline, bootstrap-styling, v-model='due')

    b-modal(id='browserRemoveCards', title='Delete cards', lazy, ok-variant='danger', @ok='deleteCards')
        | Really delete?


</template>

<script>

import ListSelector from '../editor/ListSelector';
import TagEditor from '../editor/TagEditor';
import padLeft from 'pad-left';
import ankiCall from '~/api/ankiCall';

export default {
    props: ['selected'],
    components: {
        ListSelector,
        TagEditor,
    },
    data () {
        return {
            deck: '',
            model: '',
            tags: [],
            due: null,
            changeDueShow: false,
        };
    },
    watch: {
        changeDueShow (v) {
            if(v) {
                const today = new Date();
                this.due = today;
            }
        },
    },
    methods: {
        formatDate (date) {
            if(date === null) return '';
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}-${padLeft(month, 2, '0')}-${padLeft(day, 2, '0')}`;
        },
        async changeDeck () {
            await ankiCall('card_update_deck_batch', {
                deck: this.deck,
                cardIds: this.selected,
            });
            this.deck = '';
            this.$emit('updateCardIds');
        },
        async changeModel () {
            await ankiCall('card_update_model_batch', {
                model: this.model,
                cardIds: this.selected,
            });
            this.model = '';
            this.$emit('updateCardIds');
        },
        async addTags () {
            await ankiCall('card_add_tag_batch', {
                tags: this.tags,
                cardIds: this.selected,
            });
            this.tags = [];
            this.$emit('updateCardIds');
        },
        async removeTags () {
            await ankiCall('card_remove_tag_batch', {
                tags: this.tags,
                cardIds: this.selected,
            });
            this.tags = [];
            this.$emit('updateCardIds');
        },
        async resetSched () {
            await ankiCall('card_sched_reset', {
                cardIds: this.selected,
            });
            this.$emit('updateCardIds');
        },
        async changeDue () {
            const dueTimestamp = (this.due.getTime() / 1000) | 0;
            await ankiCall('card_sched_reschedule', {
                cardIds: this.selected,
                minDue: dueTimestamp,
                maxDue: dueTimestamp,
            });
            this.due = null;
            this.$emit('updateCardIds');
        },
        async deleteCards () {
            await ankiCall('card_delete_batch', {
                cardIds: this.selected,
            });
            this.$emit('updateCardIds');
        },
    }
};

</script>
