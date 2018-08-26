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


</template>

<script>

import ListSelector from '../editor/ListSelector';
import TagEditor from '../editor/TagEditor';
import { ankiCall } from '../../api/ankiCall';

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
        };
    },
    methods: {
        async changeDeck () {
            await ankiCall('card_update_deck_batch', {
                deck: this.deck,
                cardIds: this.selected,
            });
            this.deck = '';
            this.$emit('updateView');
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
            this.$emit('updateView');
        },
        async removeTags () {
            await ankiCall('card_remove_tag_batch', {
                tags: this.tags,
                cardIds: this.selected,
            });
            this.tags = [];
            this.$emit('updateView');
        }
    }
};

</script>
